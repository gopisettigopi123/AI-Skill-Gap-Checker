"use client";

import React, { useRef } from "react";
import { AnalysisResult } from "@/types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Download, Copy, Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ResultsDisplayProps {
  result: AnalysisResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case "Qualified":
        return {
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
          progressColor: "#10b981", // emerald-500
        };
      case "Almost There":
        return {
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
          progressColor: "#f59e0b", // amber-500
        };
      case "Not Yet":
      default:
        return {
          color: "text-rose-500",
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/20",
          icon: <XCircle className="w-8 h-8 text-rose-500" />,
          progressColor: "#f43f5e", // rose-500
        };
    }
  };

  const config = getVerdictConfig(result.verdict);

  const handleCopy = () => {
    const text = `
Match Percentage: ${result.matchPercentage}%
Verdict: ${result.verdict}

Reasons:
${result.reasons.map((r) => `- ${r}`).join("\n")}

Matched Skills: ${result.matchedSkills.join(", ")}
Missing Skills: ${result.missingSkills.join(", ")}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    // Rely on native browser printing which perfectly supports modern CSS like oklch/oklab
    // without the html2canvas parsing errors.
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 print-area"
    >
      <div className="flex items-center justify-end space-x-2 no-print">
        <button
          onClick={handleCopy}
          className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md bg-muted hover:bg-muted/80 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied!" : "Copy Results"}</span>
        </button>
        <button
          onClick={handleDownloadPdf}
          className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Printable Area */}
      <div
        ref={printRef}
        className="bg-card border rounded-xl p-6 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Circular Progress & Verdict */}
          <div className="col-span-1 flex flex-col items-center justify-center space-y-6">
            <div className="w-48 h-48">
              <CircularProgressbar
                value={result.matchPercentage}
                text={`${result.matchPercentage}%`}
                styles={buildStyles({
                  pathColor: config.progressColor,
                  textColor: config.progressColor,
                  trailColor: "var(--border)",
                  textSize: "24px",
                })}
              />
            </div>
            <div
              className={cn(
                "flex items-center space-x-3 px-6 py-3 rounded-full border",
                config.bgColor,
                config.borderColor
              )}
            >
              {config.icon}
              <span className={cn("text-xl font-bold", config.color)}>
                {result.verdict}
              </span>
            </div>
          </div>

          {/* Reasons */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold tracking-tight">Key Takeaways</h3>
            <ul className="space-y-4">
              {result.reasons.map((reason, index) => (
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  key={index}
                  className="flex items-start space-x-3 bg-muted/50 p-4 rounded-lg border"
                >
                  <div className="mt-1">
                    <CheckCircle2 className="w-5 h-5 text-primary-500" />
                  </div>
                  <span className="text-muted-foreground leading-relaxed">
                    {reason}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
          {/* Matched Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Matched Skills</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.matchedSkills.length > 0 ? (
                result.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  No matched skills found.
                </span>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              <span>Missing Skills</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.length > 0 ? (
                result.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  No missing skills. Great!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
