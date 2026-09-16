import { Product } from "@/lib/types";
import { AlertTriangle, Boxes, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface InventoryAlertCardProps {
  lowStockProducts: Product[];
}

export function InventoryAlertCard({ lowStockProducts }: InventoryAlertCardProps) {
  return (
    <div className="rounded-xl border border-hairline/90 bg-surface-1 shadow-xs overflow-hidden flex flex-col h-full">
      <div className="px-5 sm:px-6 py-4 border-b border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-rose/10 border border-accent-rose/20 flex items-center justify-center text-accent-rose shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-ink">
              Alertes Ruptures de Stocks
            </h2>
            <p className="text-[11px] text-ink-subtle hidden sm:block">
              Seuil critique &lt; 15 unités
            </p>
          </div>
        </div>
        <Link 
          href="/inventory" 
          className="text-xs text-primary hover:text-primary-hover flex items-center gap-1.5 font-medium transition-colors group"
        >
          <span>Gérer</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        {lowStockProducts.length === 0 ? (
          <div className="py-10 text-center text-xs text-ink-subtle flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-ink text-sm">Stocks optimaux</p>
              <p className="text-xs text-ink-muted mt-0.5">Aucun article n'est proche de la rupture de stock</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div 
                key={p.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-surface-2/60 border border-hairline text-xs hover:border-hairline-strong transition-colors"
              >
                <div>
                  <div className="font-medium text-ink">{p.name}</div>
                  <div className="text-[10px] font-mono text-ink-subtle mt-0.5">{p.code} · {p.category}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-accent-rose tnum px-2 py-0.5 rounded bg-accent-rose/10 border border-accent-rose/20">
                    {p.stock_quantity} restant(s)
                  </span>
                  <div className="text-[10px] text-ink-muted mt-1">Réapprovisionner</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-hairline flex items-center justify-between text-xs text-ink-muted font-mono">
          <span>Articles sous surveillance</span>
          <span className="text-ink font-semibold">{lowStockProducts.length} référence(s)</span>
        </div>
      </div>
    </div>
  );
}
