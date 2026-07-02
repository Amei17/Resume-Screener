import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const GEMINI_QUOTA_ERROR_MESSAGE =
  "Gemini API quota exceeded. Please try again later or use a different API key.";

class GeminiQuotaError extends Error {
  constructor() {
    super(GEMINI_QUOTA_ERROR_MESSAGE);
    this.name = "GeminiQuotaError";
  }
}

function isGeminiQuotaError(error: unknown): boolean {
  const maybeError = error as {
    status?: number;
    code?: number | string;
    message?: string;
  };

  const status = Number(maybeError?.status ?? maybeError?.code);
  const message = String(maybeError?.message ?? error ?? "").toLowerCase();

  return (
    status === 429 ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("rate_limit") ||
    message.includes("too many requests") ||
    message.includes("resource_exhausted")
  );
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const PDFParser = require("pdf2json");
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error("Error extracting text from PDF:", errData.parserError);
      reject(new Error("Failed to extract text from PDF"));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      let text = "";

      if (pdfData.Pages) {
        pdfData.Pages.forEach((page: any) => {
          if (page.Texts) {
            page.Texts.forEach((textItem: any) => {
              if (textItem.R) {
                textItem.R.forEach((r: any) => {
                  if (r.T) {
                    text += decodeURIComponent(r.T) + " ";
                  }
                });
              }
            });
          }
        });
      }

      resolve(text.trim());
    });

    pdfParser.parseBuffer(buffer);
  });
}

async function screenResumeWithGemini(
  resumeText: string,
  jobDescriptionText: string
): Promise<any> {

  const prompt = `
You are an ATS Resume Screening Engine.

Your job is to compare a resume with a job description using ONLY the scoring rules below.

=========================
SCORING RULES
=========================

1. Skills Match (50 points)
- All required skills found = 50
- Most required skills found = 40
- About half found = 25
- Few found = 10
- No relevant skills = 0

2. Experience (30 points)
- Exceeds requirement = 30
- Meets requirement = 25
- Slightly below = 15
- Limited = 5
- None = 0

3. Education (20 points)
- Required qualification = 20
- Related qualification = 15
- Partial qualification = 10
- No relevant qualification = 0

IMPORTANT:

overallMatchScore MUST equal

Skills Score +
Experience Score +
Education Score

Do NOT estimate.

Do NOT randomly choose a score.

Use ONLY the scoring rules above.

If the same resume and job description are provided again, produce the same result.

=========================

Job Description:

${jobDescriptionText}

=========================

Resume:

${resumeText}

=========================

Return ONLY valid JSON.

{
  "candidateName":"",
  "overallMatchScore":0,
  "skillsMatched":[],
  "missingSkills":[],
  "strengths":[],
  "weaknesses":[],
  "inconsistencies":[],
  "recommendation":"",
  "scoreReasons":[
    {
      "category":"Skills",
      "score":0,
      "reason":""
    },
    {
      "category":"Experience",
      "score":0,
      "reason":""
    },
    {
      "category":"Education",
      "score":0,
      "reason":""
    }
  ]
}
`;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
       config: {
    temperature: 0,
    topP: 0,
    candidateCount: 1,
  },
    });

    let text = response.text ?? "";

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    if (isGeminiQuotaError(error)) {
      throw new GeminiQuotaError();
    }
    throw new Error("Failed to analyze resume");
  }
}

export async function POST(request: NextRequest) {

  try {

    const formData = await request.formData();

    const jobDescriptionFile =
      formData.get("jobDescription") as File;

    const resumeFiles =
      formData.getAll("resumes") as File[];

    if (!jobDescriptionFile || resumeFiles.length === 0) {
      return NextResponse.json(
        {
          error:
            "Job description and at least one resume are required",
        },
        {
          status: 400,
        }
      );
    }

    const jobDescriptionBuffer = Buffer.from(
      await jobDescriptionFile.arrayBuffer()
    );

    const jobDescriptionText =
      await extractTextFromPDF(jobDescriptionBuffer);

    const results = [];

    for (const [index, resumeFile] of resumeFiles.entries()) {

      try {

        const resumeBuffer = Buffer.from(
          await resumeFile.arrayBuffer()
        );

        const resumeText =
          await extractTextFromPDF(resumeBuffer);

        const screeningResult =
          await screenResumeWithGemini(
            resumeText,
            jobDescriptionText
          );

        results.push({
          id: `${resumeFile.name}-${index}`,
          candidateName:
            screeningResult.candidateName ?? "Unknown",
          resumeFileName:
            resumeFile.name,
          overallMatchScore:
            screeningResult.overallMatchScore,
          skillsMatched:
            screeningResult.skillsMatched,
          missingSkills:
            screeningResult.missingSkills,
          strengths:
            screeningResult.strengths,
          weaknesses:
            screeningResult.weaknesses,
          inconsistencies:
            screeningResult.inconsistencies ?? [],
          recommendation:
            screeningResult.recommendation,
          scoreReasons:
            screeningResult.scoreReasons,
        });

      } catch (error) {

        if (error instanceof GeminiQuotaError) {
          return NextResponse.json(
            {
              error: GEMINI_QUOTA_ERROR_MESSAGE,
            },
            {
              status: 429,
            }
          );
        }

        console.error(
          `Error processing ${resumeFile.name}`,
          error
        );

      }

    }

    return NextResponse.json({
      results,
    });

  } catch (error) {

    console.error(error);

    if (error instanceof GeminiQuotaError) {
      return NextResponse.json(
        {
          error: GEMINI_QUOTA_ERROR_MESSAGE,
        },
        {
          status: 429,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );

  }

}
