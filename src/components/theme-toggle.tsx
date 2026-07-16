"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 scale-100 transition-transform dark:scale-0" />
      <Moon className="absolute h-5 w-5 scale-0 transition-transform dark:scale-100" />
    </button>
  );
}
