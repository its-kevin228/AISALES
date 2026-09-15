"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShoppingBag, 
  Boxes, 
  CreditCard, 
  ShieldCheck, 
  Radio, 
  Zap 
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  { label: "Vue d'Ensemble", href: "/", icon: LayoutDashboard },
  { label: "Messagerie Live", href: "/inbox", icon: MessageSquare, badge: "3" },
  { label: "Commandes & Devis", href: "/orders", icon: ShoppingBag, badge: "2" },
  { label: "Catalogue & Stocks", href: "/inventory", icon: Boxes },
  { label: "Caisse & Reçus", href: "/cashdesk", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-hairline bg-surface-1 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="h-14 border-b border-hairline flex items-center px-4 gap-2.5">
        <div className="w-7 h-7 rounded bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
          <Zap className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-tight text-ink">omnisales-ai</span>
          <span className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">Commerce Copilot</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        <div className="px-2.5 pb-2 text-[10px] uppercase font-mono font-medium text-ink-subtle tracking-wider">
          Poste de travail
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition-colors group",
                isActive 
                  ? "bg-surface-3 text-ink border border-hairline-strong shadow-sm" 
                  : "text-ink-muted hover:text-ink hover:bg-surface-2"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={clsx("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-ink-subtle group-hover:text-ink-muted")} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={clsx(
                  "px-1.5 py-0.5 rounded text-[10px] font-mono",
                  isActive ? "bg-primary text-white" : "bg-surface-3 text-ink-muted border border-hairline"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status Indicators */}
      <div className="p-3 border-t border-hairline bg-surface-2/40 space-y-2">
        <div className="text-[10px] uppercase font-mono text-ink-subtle tracking-wider px-1">
          Statut Système
        </div>
        
        <div className="flex items-center justify-between text-[11px] px-1 text-ink-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
            <span>Meta Webhook</span>
          </div>
          <span className="font-mono text-[10px] text-accent-emerald">200 OK</span>
        </div>

        <div className="flex items-center justify-between text-[11px] px-1 text-ink-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
            <span>PostgreSQL 18</span>
          </div>
          <span className="font-mono text-[10px] text-ink-subtle">Docker</span>
        </div>

        <div className="flex items-center justify-between text-[11px] px-1 text-ink-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Gemini 2.0 Flash</span>
          </div>
          <span className="font-mono text-[10px] text-primary">Prêt</span>
        </div>
      </div>
    </aside>
  );
}
