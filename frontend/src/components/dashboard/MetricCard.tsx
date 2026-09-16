import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    positive?: boolean;
    text: string;
  };
  icon?: LucideIcon;
}

export function MetricCard({ label, value, subtext, trend, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-hairline/90 bg-surface-1 p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:border-hairline-strong hover:shadow-xs transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-muted font-mono">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-surface-2 border border-hairline flex items-center justify-center text-ink-subtle group-hover:text-primary group-hover:border-primary/30 transition-colors shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4 mb-2">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-ink font-mono tnum">
          {value}
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 text-xs pt-1 border-t border-hairline/50">
        {trend && (
          <span
            className={clsx(
              "text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold tracking-wide flex items-center gap-1 shrink-0",
              trend.positive 
                ? "text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/25" 
                : "text-accent-rose bg-accent-rose/10 border border-accent-rose/25"
            )}
          >
            <span className={clsx("w-1 h-1 rounded-full", trend.positive ? "bg-accent-emerald" : "bg-accent-rose")} />
            {trend.text}
          </span>
        )}
        {subtext && <span className="text-[11px] text-ink-subtle truncate">{subtext}</span>}
      </div>
    </div>
  );
}
