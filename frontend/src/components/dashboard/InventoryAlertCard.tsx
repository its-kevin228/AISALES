import { Product } from "@/lib/types";
import { AlertTriangle, Boxes, ArrowRight } from "lucide-react";
import Link from "next/link";

interface InventoryAlertCardProps {
  lowStockProducts: Product[];
}

export function InventoryAlertCard({ lowStockProducts }: InventoryAlertCardProps) {
  return (
    <div className="rounded border border-hairline bg-surface-1 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent-rose" />
          <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-ink">
            Alertes Ruptures de Stocks
          </h2>
        </div>
        <Link 
          href="/inventory" 
          className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-medium transition-colors"
        >
          <span>Gérer</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between">
        {lowStockProducts.length === 0 ? (
          <div className="py-6 text-center text-xs text-ink-subtle flex flex-col items-center gap-2">
            <Boxes className="w-6 h-6 text-accent-emerald" />
            <span>Tous les niveaux de stock sont optimaux.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div 
                key={p.id} 
                className="flex items-center justify-between p-2 rounded bg-surface-2/60 border border-hairline text-xs"
              >
                <div>
                  <div className="font-medium text-ink">{p.name}</div>
                  <div className="text-[10px] font-mono text-ink-subtle">{p.code} · {p.category}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-accent-rose tnum">
                    {p.stock_quantity} restant(s)
                  </span>
                  <div className="text-[10px] text-ink-muted">A réapprovisionner</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-[11px] text-ink-muted font-mono">
          <span>Articles sous surveillance</span>
          <span className="text-ink font-semibold">{lowStockProducts.length} référence(s)</span>
        </div>
      </div>
    </div>
  );
}
