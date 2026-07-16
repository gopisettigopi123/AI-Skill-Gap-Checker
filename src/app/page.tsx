"use client";

import { useState, useCallback, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ResultsDisplay } from "@/components/results-display";
import { HistorySidebar } from "@/components/history-sidebar";
import { useDropzone } from "react-dropzone";
import { FileText, UploadCloud, Loader2, Sparkles, X, AlertTriangle } from "lucide-react";
import { AnalysisResult } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    // Load history on mount
    const saved = localStorage.getItem("resume_analysis_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (_e) {
        console.error("Failed to parse history");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setResumeFile(acceptedFiles[0]);
      setResumeText(""); // clear text if file uploaded
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResumeFile(null);
  };

  const handleAnalyze = async () => {
    if (!jobDescription) {
      setError("Please provide a Job Description.");
      return;
    }
    if (!resumeText && !resumeFile) {
      setError("Please provide a Resume (text or PDF).");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      } else {
        formData.append("resumeText", resumeText);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      // Add to history
      const newResult: AnalysisResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        jobRole: "Recent Analysis",
        ...data,
      };

      setResult(newResult);
      
      const newHistory = [newResult, ...history].slice(0, 10); // Keep last 10
      setHistory(newHistory);
      localStorage.setItem("resume_analysis_history", JSON.stringify(newHistory));
      
    } catch (err: unknown) {
      setError((err as Error).message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = (id: string) => {
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem("resume_analysis_history", JSON.stringify(newHistory));
    
    // Clear currently viewed result if it was just deleted
    if (result?.id === id) {
      setResult(null);
    }
  };

  const handleSelectHistory = (selectedResult: AnalysisResult) => {
    setResult(selectedResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Input Section */}
            <section className="bg-card border rounded-xl p-6 md:p-8 shadow-sm space-y-8 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Evaluate Candidate Fit</h2>
                <p className="text-muted-foreground">
                  Paste the job description and upload a candidate&apos;s resume to get an AI-powered fit verdict and skill gap analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* JD Input */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-primary-500" />
                    <span>Job Description</span>
                  </label>
                  <textarea
                    className="w-full h-[280px] p-4 rounded-lg border bg-background resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                {/* Resume Input */}
                <div className="space-y-3 flex flex-col">
                  <label className="text-sm font-semibold flex items-center space-x-2">
                    <UploadCloud className="w-4 h-4 text-primary-500" />
                    <span>Candidate Resume</span>
                  </label>
                  
                  <div className="flex-1 flex flex-col gap-3">
                    <div
                      {...getRootProps()}
                      className={cn(
                        "relative flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center h-[120px] min-h-[120px]",
                        isDragActive ? "border-primary-500 bg-primary-500/5" : "border-border hover:border-primary-500/50 hover:bg-muted/50",
                        resumeFile && "border-emerald-500/50 bg-emerald-500/5"
                      )}
                    >
                      <input {...getInputProps()} />
                      {resumeFile ? (
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="w-8 h-8 text-emerald-500" />
                          <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1 rounded-full">
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[150px]">
                              {resumeFile.name}
                            </span>
                            <button onClick={removeFile} className="p-1 hover:bg-emerald-500/20 rounded-full transition-colors text-emerald-600 dark:text-emerald-400">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Drag & drop PDF here</p>
                          <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 py-1">
                      <div className="h-px bg-border flex-1" />
                      <span className="text-xs text-muted-foreground font-medium uppercase">or paste text</span>
                      <div className="h-px bg-border flex-1" />
                    </div>

                    <textarea
                      className="w-full flex-1 min-h-[100px] p-4 rounded-lg border bg-background resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none disabled:opacity-50"
                      placeholder="Paste resume text if you don't have a PDF..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      disabled={resumeFile !== null}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t relative z-10">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium flex items-center space-x-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Analyze Fit</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Results Section */}
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col items-center justify-center p-12 space-y-4"
                >
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary-500/20" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
                  </div>
                  <p className="text-muted-foreground animate-pulse font-medium">AI is evaluating candidate fit...</p>
                </motion.div>
              )}

              {!loading && result && (
                <ResultsDisplay key={result.id} result={result} />
              )}
            </AnimatePresence>

          </div>
          
          {/* Sidebar Area */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <HistorySidebar 
                history={history} 
                onSelect={handleSelectHistory} 
                onDelete={handleDeleteHistory}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
