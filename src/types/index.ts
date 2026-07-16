export interface AnalysisResult {
  id: string;
  timestamp: number;
  jobRole: string; // optionally inferred or provided, will just call it 'Recent Analysis'
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  verdict: "Qualified" | "Almost There" | "Not Yet";
  reasons: string[];
}
