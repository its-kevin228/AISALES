"use client";

import { useEffect } from "react";
import { X, Check, Clock, User, Phone, MapPin, Receipt, ShieldCheck } from "lucide-react";
import { Order } from "@/lib/types";
import { formatFCFA, formatDate } from "@/lib/utils";

interface OrderDetailDrawerProps {
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string) => Promise<void>;
  isConfirming: boolean;
}

export function OrderDetailDrawer({
  order,
  onClose,
  onConfirm,
  isConfirming,
}: OrderDetailDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && order) {
        if (order.status === "draft" || order.status === "pending_validation") {
          e.preventDefault();
          onConfirm(order.id);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [order, onClose, onConfirm]);

  if (!order) return null;

  const canConfirm = order.status === "draft" || order.status === "pending_validation";

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-surface-1 border-l border-hairline shadow-2xl z-50 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="p-4 border-b border-hairline flex items-center justify-between bg-surface-2/40">
          <div>
            <span className="text-[10px] font-mono uppercase text-ink-subtle">Fiche Commande</span>
            <h2 className="text-sm font-semibold font-mono text-ink">{order.order_number}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-muted hover:text-ink hover:bg-surface-3 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {/* Status Alert */}
          <div className="p-3 rounded border border-hairline bg-surface-2/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-amber" />
              <div>
                <div className="text-xs font-semibold text-ink">Statut Actuel</div>
                <div className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
                  {order.status === "pending_validation" ? "Reçu à vérifier (Human-in-the-Loop)" : order.status}
                </div>
              </div>
            </div>
            {order.status === "confirmed" && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
                Confirmée
              </span>
            )}
          </div>

          {/* Customer Details */}
          <div className="space-y-2 text-xs">
            <h3 className="text-[10px] font-mono uppercase text-ink-subtle tracking-wider font-semibold">
              Coordonnées Client
            </h3>
            <div className="p-3 rounded border border-hairline bg-surface-2/30 space-y-2">
              <div className="flex items-center gap-2 text-ink">
                <User className="w-3.5 h-3.5 text-ink-subtle" />
                <span>Client WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted font-mono text-[11px]">
                <Phone className="w-3.5 h-3.5 text-ink-subtle" />
                <span>ID: {order.customer_id.slice(0, 18)}...</span>
              </div>
              <div className="flex items-center gap-2 text-ink-muted text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-ink-subtle" />
                <span>Abidjan, Zone Industrielle Yopougon</span>
              </div>
            </div>
          </div>

          {/* Order Lines */}
          <div className="space-y-2 text-xs">
            <h3 className="text-[10px] font-mono uppercase text-ink-subtle tracking-wider font-semibold">
              Lignes de Produits Commandés ({order.lines?.length || 0})
            </h3>
            <div className="divide-y divide-hairline border border-hairline rounded bg-surface-2/30">
              {order.lines && order.lines.length > 0 ? (
                order.lines.map((line) => (
                  <div key={line.id} className="p-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-ink">
                        {line.product?.name || `Article SKU`}
                      </div>
                      <div className="text-[10px] font-mono text-ink-subtle">
                        {line.quantity} unité(s) × {formatFCFA(line.unit_price)}
                      </div>
                    </div>
                    <div className="font-mono font-semibold text-ink tnum">
                      {formatFCFA(line.subtotal)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-ink-subtle">
                  Détail des lignes en cours de saisie...
                </div>
              )}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-3 rounded border border-hairline bg-surface-2/60 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-ink-muted">
              <span>Sous-total HT</span>
              <span>{formatFCFA(order.total_amount)}</span>
            </div>
            <div className="flex items-center justify-between text-ink-muted">
              <span>TVA (0%)</span>
              <span>0 FCFA</span>
            </div>
            <div className="pt-2 border-t border-hairline flex items-center justify-between font-bold text-sm text-ink">
              <span>Total TTC</span>
              <span className="text-primary">{formatFCFA(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-hairline bg-surface-2/40 space-y-2">
        {canConfirm ? (
          <button
            onClick={() => onConfirm(order.id)}
            disabled={isConfirming}
            className="w-full py-2.5 px-4 rounded bg-accent-emerald text-white text-xs font-semibold hover:bg-accent-emerald/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{isConfirming ? "Validation en cours..." : "Confirmer la Vente (1-Clic)"}</span>
            <kbd className="text-[10px] font-mono bg-black/20 px-1 py-0.5 rounded ml-1">Ctrl+Enter</kbd>
          </button>
        ) : (
          <div className="p-2.5 rounded bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-center text-xs font-mono font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Vente déjà confirmée par l'opérateur</span>
          </div>
        )}
      </div>
    </div>
  );
}
