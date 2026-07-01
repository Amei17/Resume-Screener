"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ResultsTable from "@/components/ResultsTable";
import Button from "@/components/Button";

export default function Home() {
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [resumes, setResumes] = useState<File[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isScreening, setIsScreening] = useState(false);

  const handleJobDescriptionUpload = (file: File) => {
    setJobDescription(file);
  };

  const handleResumesUpload = (files: File[]) => {
    setResumes(files);
  };

  const handleScreen = async () => {
    if (!jobDescription || resumes.length === 0) {
      alert("Please upload a job description and at least one resume.");
      return;
    }

    setIsScreening(true);
    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription!);
      resumes.forEach((resume) => {
        formData.append("resumes", resume);
      });

      const response = await fetch("/api/screen", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Screening failed");
      }

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Error screening resumes:", error);
      alert("Failed to screen resumes. Please try again.");
    } finally {
      setIsScreening(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            AI Resume Screener
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Upload a job description and resumes to get AI-powered screening results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FileUpload
            title="Job Description"
            accept=".pdf"
            multiple={false}
            onFilesChange={handleJobDescriptionUpload}
          />
          <FileUpload
            title="Resumes"
            accept=".pdf"
            multiple={true}
            onFilesChange={handleResumesUpload}
          />
        </div>

        {jobDescription && resumes.length > 0 && (
          <div className="mb-8 flex justify-center">
            <Button
              onClick={handleScreen}
              disabled={isScreening}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              {isScreening ? "Screening..." : "Screen Resumes"}
            </Button>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Screening Results
            </h2>
            <ResultsTable results={results} />
          </div>
        )}
      </div>
    </main>
  );
}
