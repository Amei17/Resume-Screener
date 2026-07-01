"use client";

import { Fragment, useState } from "react";
import { ArrowUpDown, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ScreeningResult {
  id: string;
  candidateName: string;
  resumeFileName: string;
  overallMatchScore: number;
  skillsMatched: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  inconsistencies: string[];
  recommendation: "Strong Hire" | "Hire" | "Maybe" | "Reject";
  scoreReasons: {
    category: string;
    score: number;
    reason: string;
  }[];
}

interface ResultsTableProps {
  results: ScreeningResult[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("overallMatchScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    if (sortColumn === "overallMatchScore") {
      aValue = a.overallMatchScore;
      bValue = b.overallMatchScore;
    } else if (sortColumn === "recommendation") {
      const order = { "Strong Hire": 4, "Hire": 3, "Maybe": 2, "Reject": 1 };
      aValue = order[a.recommendation];
      bValue = order[b.recommendation];
    } else {
      aValue = a[sortColumn as keyof ScreeningResult];
      bValue = b[sortColumn as keyof ScreeningResult];
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Strong Hire":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Hire":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Maybe":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Reject":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "Strong Hire":
      case "Hire":
        return <CheckCircle className="w-4 h-4" />;
      case "Maybe":
        return <AlertCircle className="w-4 h-4" />;
      case "Reject":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
              onClick={() => handleSort("candidateName")}
            >
              <div className="flex items-center gap-2">
                Candidate
                {sortColumn === "candidateName" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
              onClick={() => handleSort("overallMatchScore")}
            >
              <div className="flex items-center gap-2">
                Match Score
                {sortColumn === "overallMatchScore" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
              onClick={() => handleSort("recommendation")}
            >
              <div className="flex items-center gap-2">
                Recommendation
                {sortColumn === "recommendation" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedResults.map((result) => (
            <Fragment key={result.id}>
              <tr
                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {result.candidateName || "Unknown"}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {result.resumeFileName}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className={`text-2xl font-bold ${getScoreColor(result.overallMatchScore)}`}>
                    {result.overallMatchScore}%
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(
                      result.recommendation
                    )}`}
                  >
                    {getRecommendationIcon(result.recommendation)}
                    {result.recommendation}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      setExpandedRow(expandedRow === result.id ? null : result.id)
                    }
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    {expandedRow === result.id ? "Hide Details" : "View Details"}
                  </button>
                </td>
              </tr>
              {expandedRow === result.id && (
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <td colSpan={4} className="px-4 py-6">
                    <div className="space-y-6">
                      {/* Score Breakdown */}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                          Score Breakdown
                        </h4>
                        <div className="space-y-2">
                          {result.scoreReasons.map((reason, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg"
                            >
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {reason.category}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  {reason.reason}
                                </div>
                              </div>
                              <div className={`text-lg font-bold ${getScoreColor(reason.score)}`}>
                                {reason.score}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                            Matched Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.skillsMatched.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                            Missing Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.missingSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Strengths and Weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                            Strengths
                          </h4>
                          <ul className="space-y-2">
                            {result.strengths.map((strength, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                            Weaknesses
                          </h4>
                          <ul className="space-y-2">
                            {result.weaknesses.map((weakness, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                              >
                                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Inconsistencies */}
                      {result.inconsistencies.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                            Employment/Education Inconsistencies
                          </h4>
                          <ul className="space-y-2">
                            {result.inconsistencies.map((inconsistency, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                              >
                                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {inconsistency}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
