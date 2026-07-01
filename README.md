# AI Resume Screener

A production-ready resume screening web application built with Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, SQLite, and OpenAI API.

## Features

- **PDF Upload**: Upload a job description PDF and multiple resume PDFs
- **Text Extraction**: Automatically extracts text from PDFs using pdf-parse
- **AI-Powered Screening**: Uses OpenAI GPT-4o to analyze resumes against job descriptions
- **Comprehensive Analysis**: Returns detailed screening results including:
  - Overall Match Score (0-100)
  - Skills Matched vs Missing Skills
  - Strengths and Weaknesses
  - Employment/Education Inconsistencies
  - Recommendation (Strong Hire, Hire, Maybe, Reject)
  - Detailed score breakdowns with transparent reasons
- **Database Storage**: Stores all data in SQLite using Prisma ORM
- **Modern UI**: Clean, responsive interface with Tailwind CSS
- **Sortable Results**: Interactive table with sorting capabilities

## Database Schema

The application uses a comprehensive database schema with the following models:

- **Candidate**: Stores candidate information (name, email, phone)
- **Resume**: Stores resume files and extracted text
- **ParsedEntity**: Stores parsed entities from resumes (name, email, education, etc.)
- **Skill**: Stores extracted skills with match status
- **ScreeningResult**: Stores overall screening results
- **ScreeningReason**: Stores detailed reasons for each score category
- **Flag**: Stores flags for potential issues (employment gaps, education mismatches, etc.)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **AI**: OpenAI GPT-4o API
- **PDF Parsing**: pdf-parse
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## Prerequisites

- Node.js 18+ installed
- OpenAI API key

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
   
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

4. **Initialize the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
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

### Database Management

- `npx prisma studio` - Open Prisma Studio to view database
- `npx prisma db push` - Push schema changes to database
- `npx prisma generate` - Generate Prisma Client

## Project Structure

```
resume-screener/
├── prisma/
│   └── schema.prisma          # Database schema
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
├── .env.example               # Environment variables example
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## License

MIT

## Notes

- The application stores resume files as base64 encoded strings in SQLite. For production use with many resumes, consider using object storage (S3, etc.) instead.
- The OpenAI API rate limits may apply when screening many resumes at once.
- Ensure your OpenAI API key has sufficient credits for the expected usage.
