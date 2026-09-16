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
  X,
  Store,
  Sparkles
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
      <header className="sticky top-0 z-30 w-full border-b border-hairline bg-surface-1/95 backdrop-blur-md select-none transition-colors">
        {/* Tier 1: Master Brand & Global Controls */}
        <div className="w-full max-w-[1536px] mx-auto h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Brand Identity + Context Pill */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-hairline bg-surface-2 text-ink-muted hover:text-ink hover:bg-surface-3 transition-colors shrink-0"
              aria-label="Menu de navigation"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <OmniSalesLogo size={24} />
            </Link>

            {/* Context / Store Environment Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-2 border border-hairline text-ink-muted">
              <Store className="w-3 h-3 text-ink-subtle" />
              <span className="font-mono">Boutique Principale</span>
              <span className="w-1 h-1 rounded-full bg-hairline-strong" />
              <span className="text-primary font-mono text-[10px] flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> IA Active
              </span>
            </div>
          </div>

          {/* Center: Spacious Raycast-style Global Command Palette Trigger */}
          <div className="flex-1 max-w-lg hidden md:flex justify-center px-4">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="w-full flex items-center justify-between gap-3 bg-surface-2 hover:bg-surface-3 border border-hairline hover:border-hairline-strong rounded-lg px-3.5 py-1.5 text-xs text-ink-muted transition-all shadow-2xs group cursor-pointer"
              title="Rechercher partout (Ctrl+K)"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-ink-subtle group-hover:text-primary transition-colors shrink-0" />
                <span className="text-ink-subtle group-hover:text-ink-muted text-xs truncate">
                  Rechercher commandes, clients, catalogue...
                </span>
              </div>
              <kbd className="text-[10px] font-mono bg-surface-3 px-1.5 py-0.5 rounded text-ink-subtle border border-hairline group-hover:text-ink shrink-0">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Utilities: Status + Quick Search (mobile) + Theme + Notifications + Operator */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Search trigger on mobile */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="md:hidden p-2 rounded-lg border border-hairline bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink transition-colors"
              aria-label="Recherche rapide"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Live Sync Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[11px] font-mono shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse shrink-0" />
              <span>Direct</span>
            </div>

            {/* Theme Toggle (Dark / Light) */}
            <ThemeToggle />

            {/* Notifications Button */}
            <button
              aria-label="Notifications"
              className="w-8 h-8 rounded-lg border border-hairline bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-ink-muted hover:text-ink transition-colors relative shrink-0"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </button>

            {/* Operator Profile Card */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-hairline shrink-0">
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-surface-3 border border-hairline-strong flex items-center justify-center text-ink font-mono text-xs font-semibold shrink-0 shadow-2xs">
                  K
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-emerald border-2 border-surface-1" />
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-medium text-ink leading-tight whitespace-nowrap">Kevin</span>
                <span className="text-[10px] text-ink-subtle leading-tight font-mono whitespace-nowrap">Ventes & Caisse</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 2: Dedicated Navigation Workbench Bar (100% full-width breathing room for tabs) */}
        <div className="border-t border-hairline/60 bg-surface-1/90 backdrop-blur-sm">
          <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-150",
                      isActive
                        ? "bg-surface-2 text-ink font-semibold border border-hairline-strong shadow-xs"
                        : "text-ink-muted hover:text-ink hover:bg-surface-2/60 border border-transparent"
                    )}
                  >
                    <Icon className={clsx("w-3.5 h-3.5 shrink-0", isActive ? "text-primary" : "text-ink-subtle")} />
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <span
                        className={clsx(
                          "ml-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono leading-none shrink-0",
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
          </div>
        </div>

        {/* Mobile / Tablet Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-hairline bg-surface-1 px-4 py-3 space-y-1 shadow-2xl animate-in slide-in-from-top-2">
            <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-ink-subtle">
              Navigation Commerciale
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
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
