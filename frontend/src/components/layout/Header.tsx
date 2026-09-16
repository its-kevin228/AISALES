"use client";

import { Search, Bell, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="h-14 border-b border-hairline bg-surface-1/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Search Input (Ctrl+K) */}
      <div className="flex items-center gap-2 bg-surface-2 border border-hairline rounded px-2.5 py-1.5 w-72 text-xs text-ink-muted focus-within:border-primary/60 transition-colors">
        <Search className="w-3.5 h-3.5 text-ink-subtle" />
        <input 
          type="text" 
          placeholder="Rechercher client, commande, SKU..." 
          className="bg-transparent text-xs text-ink placeholder-ink-subtle focus:outline-none w-full"
        />
        <kbd className="text-[10px] font-mono bg-surface-3 px-1 py-0.5 rounded text-ink-subtle border border-hairline">
          Ctrl K
        </kbd>
      </div>

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
  );
}
