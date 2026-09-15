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
    <div className="rounded border border-hairline bg-surface-1 p-4 flex flex-col justify-between hover:border-hairline-strong transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-ink-subtle" />}
      </div>

      <div className="mt-3 mb-1">
        <div className="text-2xl font-semibold tracking-tight text-ink tnum">
          {value}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={clsx(
              "text-[10px] font-mono px-1.5 py-0.5 rounded font-medium",
              trend.positive 
                ? "text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20" 
                : "text-accent-rose bg-accent-rose/10 border border-accent-rose/20"
            )}
          >
            {trend.text}
          </span>
        )}
        {subtext && <span className="text-[11px] text-ink-subtle">{subtext}</span>}
      </div>
    </div>
  );
}
