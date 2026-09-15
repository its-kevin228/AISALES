"use client";

import { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { api } from "@/lib/api";
import { OCRComparisonCard } from "@/components/cashdesk/OCRComparisonCard";
import { ReceiptLightbox } from "@/components/cashdesk/ReceiptLightbox";
import { RefreshCw, CreditCard, ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function CashdeskPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOrder, setLightboxOrder] = useState<Order | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all" | "confirmed">("pending");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      console.error("Failed to load cashdesk orders:", err);
      setError(err.message || "Erreur de chargement des encaissements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmPayment = async (orderId: string) => {
    try {
      setConfirmingId(orderId);
      await api.confirmOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(`Erreur de validation de l'encaissement: ${err.message}`);
    } finally {
      setConfirmingId(null);
    }
  };

  const receiptOrders = orders.filter((o) => o.receipt_data || o.status === "pending_validation");
  const pendingReceipts = receiptOrders.filter(
    (o) => o.status === "pending_validation" || o.status === "draft"
  );
  const confirmedReceipts = receiptOrders.filter((o) => o.status === "confirmed");

  const displayedOrders =
    filter === "pending"
      ? pendingReceipts
      : filter === "confirmed"
      ? confirmedReceipts
      : receiptOrders;

  const totalCollected = confirmedReceipts.reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-primary" />
            <span>Caisse et Contrôle Anti-Fraude des Reçus</span>
          </h1>
          <p className="text-xs text-ink-subtle mt-1 font-mono">
            Rapprochement automatisé par Vision OCR des paiements Wave, Orange Money et MTN MoMo
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-ink text-xs font-mono transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded border border-hairline bg-surface-1 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-ink-subtle uppercase">Reçus à Vérifier</span>
            <div className="text-xl font-semibold font-mono text-accent-amber tnum">
              {pendingReceipts.length}
            </div>
          </div>
          <Clock className="w-5 h-5 text-accent-amber/60" />
        </div>

        <div className="p-3.5 rounded border border-hairline bg-surface-1 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-ink-subtle uppercase">Encaissements Validés</span>
            <div className="text-xl font-semibold font-mono text-accent-emerald tnum">
              {confirmedReceipts.length}
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-accent-emerald/60" />
        </div>

        <div className="p-3.5 rounded border border-hairline bg-surface-1 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-mono text-ink-subtle uppercase">Volume Encaissé Vérifié</span>
            <div className="text-xl font-semibold font-mono text-ink tnum">
              {formatFCFA(totalCollected)}
            </div>
          </div>
          <CreditCard className="w-5 h-5 text-ink-subtle" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-hairline pb-2">
        <button
          onClick={() => setFilter("pending")}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
            filter === "pending"
              ? "bg-accent-amber/10 text-accent-amber border border-accent-amber/30 font-semibold"
              : "text-ink-muted hover:text-ink hover:bg-surface-2"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
          <span>En attente ({pendingReceipts.length})</span>
        </button>

        <button
          onClick={() => setFilter("confirmed")}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
            filter === "confirmed"
              ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30 font-semibold"
              : "text-ink-muted hover:text-ink hover:bg-surface-2"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
          <span>Validés ({confirmedReceipts.length})</span>
        </button>

        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
            filter === "all"
              ? "bg-surface-3 text-ink border border-hairline font-semibold"
              : "text-ink-muted hover:text-ink hover:bg-surface-2"
          }`}
        >
          Tous ({receiptOrders.length})
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded border border-accent-rose/30 bg-accent-rose/10 text-accent-rose text-xs font-mono">
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {displayedOrders.length === 0 ? (
          <div className="p-12 text-center rounded border border-hairline bg-surface-1 space-y-2">
            <ShieldCheck className="w-10 h-10 text-accent-emerald mx-auto" />
            <div className="text-sm font-semibold text-ink">Aucun reçu en attente d'inspection</div>
            <div className="text-xs text-ink-subtle">
              Toutes les transactions soumises par les clients ont été traitées ou aucun reçu n'est en attente.
            </div>
          </div>
        ) : (
          displayedOrders.map((order) => (
            <OCRComparisonCard
              key={order.id}
              order={order}
              onPreviewReceipt={(o) => setLightboxOrder(o)}
              onConfirmPayment={handleConfirmPayment}
              isConfirming={confirmingId === order.id}
            />
          ))
        )}
      </div>

      {/* Lightbox Modal */}
      <ReceiptLightbox
        isOpen={lightboxOrder !== null}
        onClose={() => setLightboxOrder(null)}
        imageUrl={lightboxOrder?.receipt_url}
        transactionRef={lightboxOrder?.receipt_data?.transaction_ref}
        operator={lightboxOrder?.receipt_data?.operator}
      />
    </div>
  );
}
