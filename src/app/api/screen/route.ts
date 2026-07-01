import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";
import { createHash } from "crypto";

const prisma = new PrismaClient();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

function generateInputHash(jobDescriptionText: string, resumeText: string): string {
  const input = jobDescriptionText + "||" + resumeText;
  return createHash("sha256").update(input).digest("hex");
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

    for (const resumeFile of resumeFiles) {

      try {

        const resumeBuffer = Buffer.from(
          await resumeFile.arrayBuffer()
        );

        const resumeText =
          await extractTextFromPDF(resumeBuffer);

        const inputHash = generateInputHash(jobDescriptionText, resumeText);

        let screeningResult;
        let cachedResult = null;

        try {
          cachedResult = await prisma.screeningResult.findUnique({
            where: { inputHash },
            include: {
              screeningReasons: true,
              resume: {
                include: {
                  candidate: true,
                },
              },
            },
          });
        } catch (error) {
          console.error("Cache lookup failed:", error);
        }

        if (cachedResult) {
          console.log("Cache hit - returning existing screening result");
          results.push({
            id: `${cachedResult.id}-${resumeFile.name}`,
            candidateName: cachedResult.resume?.candidate?.name ?? "Unknown",
            resumeFileName: resumeFile.name,
            overallMatchScore: cachedResult.overallMatchScore,
            skillsMatched: JSON.parse(cachedResult.skillsMatched),
            missingSkills: JSON.parse(cachedResult.missingSkills),
            strengths: JSON.parse(cachedResult.strengths),
            weaknesses: JSON.parse(cachedResult.weaknesses),
            inconsistencies: JSON.parse(cachedResult.inconsistencies),
            recommendation: cachedResult.recommendation,
            scoreReasons: cachedResult.screeningReasons.map((reason: any) => ({
              category: reason.category,
              score: reason.score,
              reason: reason.reason,
            })),
          });
          continue;
        }

        screeningResult =
          await screenResumeWithGemini(
            resumeText,
            jobDescriptionText
          );
                  const candidate =
          await prisma.candidate.create({
            data: {
              name:
                screeningResult.candidateName ??
                "Unknown",
            },
          });

        const resume =
          await prisma.resume.create({
            data: {
              fileName: resumeFile.name,
              fileData:
                resumeBuffer.toString("base64"),
              extractedText: resumeText,
              candidateId: candidate.id,
            },
          });

        for (const skill of screeningResult.skillsMatched ?? []) {

          await prisma.skill.create({
            data: {
              name: skill,
              matched: true,
              resumeId: resume.id,
            },
          });

        }

        for (const skill of screeningResult.missingSkills ?? []) {

          await prisma.skill.create({
            data: {
              name: skill,
              matched: false,
              resumeId: resume.id,
            },
          });

        }

        const screeningResultDb =
          await prisma.screeningResult.create({
            data: {
              inputHash,
              overallMatchScore:
                screeningResult.overallMatchScore,
              recommendation:
                screeningResult.recommendation,
              strengths: JSON.stringify(
                screeningResult.strengths ?? []
              ),
              weaknesses: JSON.stringify(
                screeningResult.weaknesses ?? []
              ),
              inconsistencies: JSON.stringify(
                screeningResult.inconsistencies ?? []
              ),
              skillsMatched: JSON.stringify(
                screeningResult.skillsMatched ?? []
              ),
              missingSkills: JSON.stringify(
                screeningResult.missingSkills ?? []
              ),
              resumeId: resume.id,
            },
          });

        for (const reason of screeningResult.scoreReasons ?? []) {

          await prisma.screeningReason.create({
            data: {
              category: reason.category,
              score: reason.score,
              reason: reason.reason,
              resultId:
                screeningResultDb.id,
            },
          });

        }

        results.push({
          id: screeningResultDb.id,
          candidateName:
            screeningResult.candidateName,
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