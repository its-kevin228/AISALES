"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShoppingBag, 
  Boxes, 
  CreditCard, 
  Search, 
  Bell, 
  Menu, 
  X 
} from "lucide-react";
import clsx from "clsx";
import { OmniSalesLogo } from "./OmniSalesLogo";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";

const NAV_ITEMS = [
  { label: "Vue d'Ensemble", href: "/", icon: LayoutDashboard },
  { label: "Messagerie Live", href: "/inbox", icon: MessageSquare, badge: "3" },
  { label: "Commandes & Devis", href: "/orders", icon: ShoppingBag, badge: "2" },
  { label: "Catalogue & Stocks", href: "/inventory", icon: Boxes },
  { label: "Caisse & Reçus", href: "/cashdesk", icon: CreditCard },
];

export function TopNavigation() {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className="h-14 border-b border-hairline bg-surface-1/95 backdrop-blur sticky top-0 z-30 select-none">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Brand Logo & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded border border-hairline bg-surface-2 text-ink-muted hover:text-ink"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <Link href="/" className="flex items-center">
              <OmniSalesLogo size={22} />
            </Link>
          </div>

          {/* Center: Horizontal Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-2/60 p-1 rounded-lg border border-hairline/80">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-surface-1 text-ink shadow-xs border border-hairline font-semibold"
                      : "text-ink-muted hover:text-ink hover:bg-surface-3/50"
                  )}
                >
                  <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-primary" : "text-ink-subtle")} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={clsx(
                        "ml-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono leading-tight",
                        isActive
                          ? "bg-primary/20 text-primary font-bold"
                          : "bg-surface-3 text-ink-subtle"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Search + Theme Toggle + User Info */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Button (Ctrl+K) */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center justify-between gap-2 bg-surface-2 hover:bg-surface-3 border border-hairline hover:border-hairline-strong rounded-lg px-2.5 py-1.5 text-xs text-ink-muted transition-colors shadow-2xs group"
            >
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-ink-subtle group-hover:text-primary transition-colors" />
                <span className="hidden lg:inline truncate text-ink-subtle group-hover:text-ink-muted">
                  Rechercher...
                </span>
              </div>
              <kbd className="text-[10px] font-mono bg-surface-3 px-1.5 py-0.5 rounded text-ink-subtle border border-hairline group-hover:text-ink">
                Ctrl K
              </kbd>
            </button>

            {/* Live Sync Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
              <span>Direct</span>
            </div>

            {/* Theme Toggle (Dark / Light) */}
            <ThemeToggle />

            {/* Notifications */}
            <button
              aria-label="Notifications"
              className="w-8 h-8 rounded-lg border border-hairline bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-muted hover:text-ink transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>

            {/* Operator Profile */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-hairline">
              <div className="w-7 h-7 rounded-lg bg-surface-3 border border-hairline-strong flex items-center justify-center text-ink font-mono text-xs font-semibold">
                K
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-medium text-ink leading-tight">Kevin</span>
                <span className="text-[10px] text-ink-subtle leading-tight font-mono">Ventes & Caisse</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-hairline bg-surface-1 px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-3 text-ink-subtle">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Command Center Modal */}
      <CommandPalette 
        isOpen={isCommandOpen} 
        onClose={() => setIsCommandOpen(false)} 
      />
    </>
  );
}
