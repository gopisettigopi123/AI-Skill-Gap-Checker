"use client";

import { AnalysisResult } from "@/types";
import { Clock, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HistorySidebarProps {
  history: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
}

export function HistorySidebar({ history, onSelect }: HistorySidebarProps) {
  if (history.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span>Recent History</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Your recent analyses will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col h-full max-h-[800px]">
      <h3 className="text-lg font-semibold flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-primary-500" />
        <span>Recent History</span>
      </h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left p-3 rounded-lg border bg-muted/30 hover:bg-muted/80 transition-colors group flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-sm flex items-center space-x-2">
                <span>{item.matchPercentage}% Match</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.verdict === "Qualified"
                      ? "bg-emerald-500"
                      : item.verdict === "Almost There"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
