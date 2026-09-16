"use client";

import { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { api } from "@/lib/api";
import { OrderDataTable } from "@/components/orders/OrderDataTable";
import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer";
import { RefreshCw, ShoppingCart, Clock, CheckCircle2, DollarSign } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isConfirmingId, setIsConfirmingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOrders();
      setOrders(data);
      if (selectedOrder) {
        const updated = data.find((o) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      setError(err.message || "Erreur de chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setIsConfirmingId(orderId);
      await api.confirmOrder(orderId);
      await fetchOrders();
    } catch (err: any) {
      alert(`Erreur validation commande: ${err.message}`);
    } finally {
      setIsConfirmingId(null);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status === "confirmed")
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  const pendingCount = orders.filter((o) => o.status === "pending_validation").length;
  const confirmedCount = orders.filter((o) => o.status === "confirmed").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span>Hub Commandes et Devis</span>
          </h1>
          <p className="text-xs text-ink-subtle mt-1 font-mono">
            Pipeline unifie des devis WhatsApp générés par l'IA et validations 1-clic
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

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-xl border border-hairline/90 bg-surface-1 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-ink-subtle uppercase tracking-wider">En attente validation</span>
            <div className="text-2xl font-bold font-mono text-accent-amber tnum">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-hairline/90 bg-surface-1 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-ink-subtle uppercase tracking-wider">Ventes Confirmées</span>
            <div className="text-2xl font-bold font-mono text-accent-emerald tnum">{confirmedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-hairline/90 bg-surface-1 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-ink-subtle uppercase tracking-wider">Chiffre d'Affaires Confirmé</span>
            <div className="text-2xl font-bold font-mono text-ink tnum">{formatFCFA(totalRevenue)}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface-2 border border-hairline flex items-center justify-center text-ink-subtle">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded border border-accent-rose/30 bg-accent-rose/10 text-accent-rose text-xs font-mono">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <OrderDataTable
        orders={orders}
        selectedOrderId={selectedOrder?.id || null}
        onSelectOrder={(order) => setSelectedOrder(order)}
        onConfirmOrder={handleConfirmOrder}
        isConfirmingId={isConfirmingId}
      />

      {/* Detail Drawer */}
      <OrderDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onConfirm={handleConfirmOrder}
        isConfirming={isConfirmingId === selectedOrder?.id}
      />
    </div>
  );
}
