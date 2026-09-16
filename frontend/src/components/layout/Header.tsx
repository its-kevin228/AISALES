"use client";

import { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";

export function Header() {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Global keyboard listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-14 border-b border-hairline bg-surface-1/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Search Input Trigger (Ctrl+K) */}
        <button
          onClick={() => setIsCommandOpen(true)}
          className="flex items-center justify-between gap-2 bg-surface-2 hover:bg-surface-3 border border-hairline hover:border-hairline-strong rounded px-3 py-1.5 w-72 text-xs text-ink-muted transition-all duration-150 cursor-pointer text-left shadow-2xs group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-ink-subtle group-hover:text-primary transition-colors" />
            <span className="truncate text-ink-subtle group-hover:text-ink-muted">
              Rechercher (Ctrl+K)...
            </span>
          </div>
          <kbd className="text-[10px] font-mono bg-surface-3 px-1.5 py-0.5 rounded text-ink-subtle border border-hairline group-hover:text-ink transition-colors">
            Ctrl K
          </kbd>
        </button>

        {/* Right Controls & User Info */}
        <div className="flex items-center gap-3">
          {/* Live sync badge */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            <span>Flux temps réel actif</span>
          </div>

          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* Notifications */}
          <button 
            aria-label="Notifications"
            className="w-8 h-8 rounded border border-hairline bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-muted hover:text-ink transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>

          {/* Operator Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-hairline">
            <div className="w-7 h-7 rounded bg-surface-3 border border-hairline-strong flex items-center justify-center text-ink font-mono text-xs font-semibold">
              K
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium text-ink leading-tight">Kevin</span>
              <span className="text-[10px] text-ink-subtle leading-tight font-mono">Ventes & Caisse</span>
            </div>
          </div>
        </div>
      </header>

      {/* Raycast-style Command Center Modal */}
      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
      />
    </>
  );
}
