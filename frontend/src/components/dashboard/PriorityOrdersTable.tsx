"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Check, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PriorityOrdersTableProps {
  orders: Order[];
  onConfirmOrder: (orderId: string) => Promise<void>;
}

export function PriorityOrdersTable({ orders, onConfirmOrder }: PriorityOrdersTableProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleConfirm = async (id: string) => {
    setConfirmingId(id);
    try {
      await onConfirmOrder(id);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-hairline/90 bg-surface-1 shadow-xs overflow-hidden flex flex-col">
      <div className="px-5 sm:px-6 py-4 border-b border-hairline flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-ink">
              Commandes Nécessitant Votre Validation
            </h2>
            <p className="text-[11px] text-ink-subtle hidden sm:block">
              Vérifiez les preuves de paiement et validez la déduction des stocks
            </p>
          </div>
        </div>
        <Link 
          href="/orders" 
          className="text-xs text-primary hover:text-primary-hover flex items-center gap-1.5 font-medium transition-colors group"
        >
          <span>Voir toutes</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-hairline bg-surface-2/60 text-ink-muted font-mono text-[11px] uppercase tracking-wider">
              <th className="py-3 px-5 font-medium whitespace-nowrap">N° Commande</th>
              <th className="py-3 px-5 font-medium whitespace-nowrap">Client WhatsApp</th>
              <th className="py-3 px-5 font-medium whitespace-nowrap">Articles</th>
              <th className="py-3 px-5 font-medium whitespace-nowrap">Montant Total</th>
              <th className="py-3 px-5 font-medium whitespace-nowrap">Statut</th>
              <th className="py-3 px-5 font-medium text-right whitespace-nowrap">Action Immédiate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-ink-subtle">
                  Aucune commande en attente d'approbation. Toutes les ventes sont à jour.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isPending = order.status === "pending_validation" || order.status === "draft";
                const isConfirmed = order.status === "confirmed";

                return (
                  <tr key={order.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-medium text-ink whitespace-nowrap">
                      {order.order_number}
                      <div className="text-[10px] text-ink-subtle font-sans">{formatDate(order.created_at)}</div>
                    </td>
                    <td className="py-3.5 px-5 text-ink font-mono whitespace-nowrap">
                      {order.customer_id ? `Client ${order.customer_id.slice(0, 8)}` : "Client WhatsApp"}
                    </td>
                    <td className="py-3.5 px-5 text-ink-muted whitespace-nowrap">
                      {order.lines.length > 0 ? `${order.lines.length} article(s)` : "En cours"}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-semibold text-ink tnum whitespace-nowrap">
                      {formatFCFA(order.total_amount)}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {order.status === "pending_validation" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
                          Reçu à vérifier
                        </span>
                      )}
                      {order.status === "draft" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-surface-3 text-ink-muted border border-hairline">
                          Devis brouillon
                        </span>
                      )}
                      {order.status === "confirmed" && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
                          Confirmée
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      {isPending ? (
                        <button
                          onClick={() => handleConfirm(order.id)}
                          disabled={confirmingId === order.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary-hover active:scale-[0.98] transition-all shadow-xs disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{confirmingId === order.id ? "Validation..." : "Valider Vente"}</span>
                        </button>
                      ) : isConfirmed ? (
                        <span className="text-[11px] font-mono text-accent-emerald font-medium">Vente Validée</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
