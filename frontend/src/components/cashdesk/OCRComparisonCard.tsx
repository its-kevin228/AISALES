"use client";

import { Order } from "@/lib/types";
import { formatFCFA, formatDate } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Eye, ShieldCheck, Phone, Hash, Calendar, DollarSign } from "lucide-react";

interface OCRComparisonCardProps {
  order: Order;
  onPreviewReceipt: (order: Order) => void;
  onConfirmPayment: (orderId: string) => Promise<void>;
  isConfirming: boolean;
}

export function OCRComparisonCard({
  order,
  onPreviewReceipt,
  onConfirmPayment,
  isConfirming,
}: OCRComparisonCardProps) {
  const receiptData = order.receipt_data || {};
  const extractedAmount = receiptData.amount ? Number(receiptData.amount) : null;
  const isAmountMatch = extractedAmount !== null && extractedAmount === order.total_amount;
  const isPending = order.status === "pending_validation" || order.status === "draft";
  const isConfirmed = order.status === "confirmed";

  const operatorBadgeClass = {
    wave: "bg-accent-blue/10 text-accent-blue border-accent-blue/30",
    orange: "bg-accent-amber/10 text-accent-amber border-accent-amber/30",
    mtn: "bg-accent-amber/10 text-accent-amber border-accent-amber/30",
  }[receiptData.operator?.toLowerCase() || ""] || "bg-surface-3 text-ink-muted border-hairline";

  return (
    <div className="rounded border border-hairline bg-surface-1 overflow-hidden shadow-sm transition-all hover:border-hairline/80">
      {/* Header bar */}
      <div className="p-3.5 border-b border-hairline bg-surface-2/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-ink">{order.order_number}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase border ${operatorBadgeClass}`}>
            {receiptData.operator || "Mobile Money"}
          </span>
        </div>
        <div className="text-[11px] font-mono text-ink-subtle">
          {formatDate(order.created_at)}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-hairline">
        {/* Left column: Commande attendue */}
        <div className="space-y-3 md:pr-4">
          <div className="text-[10px] font-mono uppercase text-ink-subtle tracking-wider font-semibold">
            Montant Attendu Commande
          </div>
          <div className="p-3 rounded border border-hairline bg-surface-2/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-muted">Total Commande:</span>
              <span className="text-base font-mono font-bold text-ink tnum">
                {formatFCFA(order.total_amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-subtle">
              <span>Articles:</span>
              <span className="font-mono">{order.lines?.length || 0} ligne(s)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-subtle">
              <span>Client:</span>
              <span className="font-mono">{order.customer_id.slice(0, 14)}...</span>
            </div>
          </div>
        </div>

        {/* Right column: Extraction IA OCR Reçu */}
        <div className="space-y-3 pt-4 md:pt-0 md:pl-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-ink-subtle tracking-wider font-semibold">
              Données Détectées par Vision OCR
            </span>
            {order.receipt_url && (
              <button
                onClick={() => onPreviewReceipt(order)}
                className="text-[11px] font-mono text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Voir reçu</span>
              </button>
            )}
          </div>

          <div className="p-3 rounded border border-hairline bg-surface-2/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Montant Reçu:</span>
              <span
                className={`font-mono font-bold tnum ${
                  extractedAmount === null
                    ? "text-ink-subtle"
                    : isAmountMatch
                    ? "text-accent-emerald"
                    : "text-accent-amber"
                }`}
              >
                {extractedAmount !== null ? formatFCFA(extractedAmount) : "En attente scan"}
              </span>
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-ink-muted">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-ink-subtle" />
                <span>Réf. Transaction:</span>
              </span>
              <span className="text-ink font-semibold">{receiptData.transaction_ref || "N/A"}</span>
            </div>

            {receiptData.sender_phone && (
              <div className="flex items-center justify-between font-mono text-[11px] text-ink-muted">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-ink-subtle" />
                  <span>Expéditeur:</span>
                </span>
                <span className="text-ink">{receiptData.sender_phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Status Banner */}
      <div className="px-4 py-2.5 bg-surface-2/60 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {extractedAmount !== null && isAmountMatch ? (
            <div className="flex items-center gap-2 text-xs text-accent-emerald font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Montants parfaitement concordants (100% vérifié)</span>
            </div>
          ) : extractedAmount !== null && !isAmountMatch ? (
            <div className="flex items-center gap-2 text-xs text-accent-amber font-mono">
              <AlertTriangle className="w-4 h-4" />
              <span>Attention: divergence entre le montant du reçu et la commande</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-ink-subtle font-mono">
              <Eye className="w-4 h-4" />
              <span>Reçu en attente de vérification manuelle</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div>
          {isPending ? (
            <button
              onClick={() => onConfirmPayment(order.id)}
              disabled={isConfirming}
              className="w-full sm:w-auto px-4 py-1.5 rounded bg-accent-emerald text-white text-xs font-mono font-semibold hover:bg-accent-emerald/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isConfirming ? "Validation..." : "Valider Paiement & Déduire Stock"}</span>
            </button>
          ) : isConfirmed ? (
            <div className="flex items-center gap-1.5 text-xs font-mono text-accent-emerald">
              <ShieldCheck className="w-4 h-4" />
              <span>Paiement Validé & Encaissé</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
