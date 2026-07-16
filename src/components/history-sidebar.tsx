"use client";

import { AnalysisResult } from "@/types";
import { Clock, ChevronRight, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface HistorySidebarProps {
  history: AnalysisResult[];
  onSelect: (result: AnalysisResult) => void;
  onDelete?: (id: string) => void;
}

export function HistorySidebar({ history, onSelect, onDelete }: HistorySidebarProps) {
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
        <AnimatePresence>
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="relative group flex items-center gap-2"
            >
              <button
                onClick={() => onSelect(item)}
                className="flex-1 text-left p-3 rounded-lg border bg-muted/30 hover:bg-muted/80 transition-all flex items-center justify-between shadow-sm hover:shadow"
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
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
              
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="p-3 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg border bg-muted/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete history item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
