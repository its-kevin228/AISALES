"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Search, CheckCircle2, ChevronRight, Eye, ArrowUpDown, Filter } from "lucide-react";

interface OrderDataTableProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (order: Order) => void;
  onConfirmOrder: (orderId: string) => Promise<void>;
  isConfirmingId: string | null;
}

function renderStatusBadge(status: string) {
  switch (status) {
    case "pending_validation":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-accent-amber/10 text-accent-amber border border-accent-amber/30">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
          A valider
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-3 text-ink-muted border border-hairline">
          Devis IA
        </span>
      );
    case "confirmed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
          Confirmée
        </span>
      );
    case "shipped":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/30">
          Expédiée
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-2 text-ink-subtle border border-hairline">
          {status}
        </span>
      );
  }
}

export function OrderDataTable({
  orders,
  selectedOrderId,
  onSelectOrder,
  onConfirmOrder,
  isConfirmingId,
}: OrderDataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filterCounts = {
    all: orders.length,
    pending_validation: orders.filter((o) => o.status === "pending_validation").length,
    draft: orders.filter((o) => o.status === "draft").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher numéro, client..."
            className="w-full bg-surface-2/60 border border-hairline rounded pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              statusFilter === "all"
                ? "bg-surface-3 text-ink border border-hairline font-semibold"
                : "text-ink-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            <span>Toutes</span>
            <span className="text-[10px] bg-surface-1 px-1.5 py-0.2 rounded border border-hairline">
              {filterCounts.all}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("pending_validation")}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              statusFilter === "pending_validation"
                ? "bg-accent-amber/10 text-accent-amber border border-accent-amber/30 font-semibold"
                : "text-ink-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber"></span>
            <span>A valider</span>
            <span className="text-[10px] bg-accent-amber/20 px-1.5 py-0.2 rounded text-accent-amber">
              {filterCounts.pending_validation}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("draft")}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              statusFilter === "draft"
                ? "bg-surface-3 text-ink border border-hairline font-semibold"
                : "text-ink-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            <span>Devis IA</span>
            <span className="text-[10px] bg-surface-1 px-1.5 py-0.2 rounded border border-hairline">
              {filterCounts.draft}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
              statusFilter === "confirmed"
                ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30 font-semibold"
                : "text-ink-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald"></span>
            <span>Confirmées</span>
            <span className="text-[10px] bg-accent-emerald/20 px-1.5 py-0.2 rounded text-accent-emerald">
              {filterCounts.confirmed}
            </span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-hairline rounded bg-surface-1 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-surface-2/40 text-[11px] font-mono text-ink-subtle uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">N° Commande</th>
                <th className="py-2.5 px-4 font-semibold">Client</th>
                <th className="py-2.5 px-4 font-semibold">Articles</th>
                <th className="py-2.5 px-4 font-semibold text-right">Montant Total</th>
                <th className="py-2.5 px-4 font-semibold">Statut</th>
                <th className="py-2.5 px-4 font-semibold">Date de création</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action Rapide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-subtle">
                    Aucune commande ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrderId === order.id;
                  const isConfirming = isConfirmingId === order.id;
                  const canQuickConfirm =
                    order.status === "draft" || order.status === "pending_validation";

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-surface-2 border-l-2 border-primary"
                          : "hover:bg-surface-2/60"
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-ink">
                        {order.order_number}
                      </td>
                      <td className="py-3 px-4 font-mono text-ink-muted text-[11px]">
                        {order.customer_id.slice(0, 14)}...
                      </td>
                      <td className="py-3 px-4 text-ink-muted">
                        {order.lines ? `${order.lines.length} article(s)` : "1 article"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-ink tnum">
                        {formatFCFA(order.total_amount)}
                      </td>
                      <td className="py-3 px-4">
                        {renderStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-4 text-ink-subtle text-[11px] font-mono">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {canQuickConfirm ? (
                          <button
                            onClick={() => onConfirmOrder(order.id)}
                            disabled={isConfirming}
                            className="px-2.5 py-1 rounded bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/20 active:scale-95 text-[11px] font-mono font-medium transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isConfirming ? "Validation..." : "Valider 1-Clic"}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="px-2 py-1 rounded text-ink-subtle hover:text-ink hover:bg-surface-3 text-[11px] font-mono transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Détails</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
