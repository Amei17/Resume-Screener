# AI Resume Screener

A production-ready resume screening web application built with Next.js 15, TypeScript, Tailwind CSS, and Gemini API.

## Features

- **PDF Upload**: Upload a job description PDF and multiple resume PDFs
- **Text Extraction**: Automatically extracts text from PDFs using pdf-parse
- **AI-Powered Screening**: Uses Gemini to analyze resumes against job descriptions
- **Comprehensive Analysis**: Returns detailed screening results including:
  - Overall Match Score (0-100)
  - Skills Matched vs Missing Skills
  - Strengths and Weaknesses
  - Employment/Education Inconsistencies
  - Recommendation (Strong Hire, Hire, Maybe, Reject)
  - Detailed score breakdowns with transparent reasons
- **Modern UI**: Clean, responsive interface with Tailwind CSS
- **Sortable Results**: Interactive table with sorting capabilities

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Gemini API
- **PDF Parsing**: pdf2json
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## Prerequisites

- Node.js 18+ installed
- Gemini API key

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd resume-screener
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Job Description**: Click on the "Job Description" upload area and select a PDF file containing the job description.

2. **Upload Resumes**: Click on the "Resumes" upload area and select one or more PDF files containing candidate resumes.

3. **Screen Resumes**: Click the "Screen Resumes" button to start the AI-powered screening process.

4. **View Results**: The application will display a sortable table with screening results for each resume.

5. **View Details**: Click "View Details" on any resume to see:
   - Score breakdown by category (Skills, Experience, Education)
   - Matched and missing skills
   - Strengths and weaknesses
   - Any identified inconsistencies

## API Endpoints

### POST /api/screen

Screens uploaded resumes against a job description.

**Request**: multipart/form-data
- `jobDescription`: PDF file of the job description
- `resumes`: Array of PDF files of resumes

**Response**: JSON
```json
{
  "results": [
    {
      "id": "string",
      "candidateName": "string",
      "resumeFileName": "string",
      "overallMatchScore": number,
      "skillsMatched": ["string"],
      "missingSkills": ["string"],
      "strengths": ["string"],
      "weaknesses": ["string"],
      "inconsistencies": ["string"],
      "recommendation": "Strong Hire" | "Hire" | "Maybe" | "Reject",
      "scoreReasons": [
        {
          "category": "string",
          "score": number,
          "reason": "string"
        }
      ]
    }
  ]
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
resume-screener/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── screen/
│   │   │       └── route.ts   # Screening API endpoint
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   └── components/
│       ├── Button.tsx         # Button component
│       ├── FileUpload.tsx     # File upload component
│       └── ResultsTable.tsx   # Results table component
├── .env.example               # Gemini environment variable example
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## License

MIT

## Notes

- Results are generated per request and are not cached in a database.
- Gemini API rate limits may apply when screening many resumes at once.
- Ensure your Gemini API key has sufficient credits for the expected usage.
