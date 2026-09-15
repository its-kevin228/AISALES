"use client";

import { useEffect, useState } from "react";
import { DollarSign, Clock, ShoppingBag, AlertTriangle, RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PriorityOrdersTable } from "@/components/dashboard/PriorityOrdersTable";
import { InventoryAlertCard } from "@/components/dashboard/InventoryAlertCard";
import { api } from "@/lib/api";
import { Order, Product } from "@/lib/types";
import { formatFCFA } from "@/lib/utils";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedOrders, fetchedProducts] = await Promise.all([
        api.getOrders().catch(() => []),
        api.getProducts().catch(() => []),
      ]);
      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
      setLastRefreshed(new Date().toLocaleTimeString("fr-FR"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Poll every 10s for real-time updates
    return () => clearInterval(interval);
  }, []);

  const handleConfirmOrder = async (orderId: string) => {
    await api.confirmOrder(orderId);
    await loadData();
  };

  // Compute live KPIs
  const confirmedOrders = orders.filter((o) => o.status === "confirmed");
  const pendingOrders = orders.filter((o) => o.status === "pending_validation");
  const draftOrders = orders.filter((o) => o.status === "draft");
  
  const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const lowStockProducts = products.filter((p) => p.stock_quantity <= 15);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Poste de Pilotage Commercial</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Supervision des commandes WhatsApp, encaissements et validations en un clic
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-ink-subtle">
            Mis à jour : {lastRefreshed || "En cours..."}
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-hairline bg-surface-2 hover:bg-surface-3 text-xs text-ink-muted hover:text-ink transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Chiffre d'Affaires Encaissé"
          value={formatFCFA(totalRevenue)}
          trend={{ positive: true, text: "+18% aujourd'hui" }}
          subtext="Ventes confirmées"
          icon={DollarSign}
        />
        <MetricCard
          label="Validations Humaines Requises"
          value={pendingOrders.length}
          trend={pendingOrders.length > 0 ? { positive: false, text: "Action requise" } : undefined}
          subtext="Reçus Mobile Money à valider"
          icon={Clock}
        />
        <MetricCard
          label="Devis WhatsApp Actifs"
          value={draftOrders.length}
          trend={{ positive: true, text: "Flux actif" }}
          subtext="En négociation par le bot"
          icon={ShoppingBag}
        />
        <MetricCard
          label="Alertes Ruptures de Stocks"
          value={lowStockProducts.length}
          trend={lowStockProducts.length > 0 ? { positive: false, text: "Critique" } : undefined}
          subtext="Moins de 15 unités restantes"
          icon={AlertTriangle}
        />
      </div>

      {/* Main Split Workbench: Priority Orders (2/3) + Inventory Alerts (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriorityOrdersTable
            orders={orders.filter((o) => o.status !== "cancelled")}
            onConfirmOrder={handleConfirmOrder}
          />
        </div>
        <div className="lg:col-span-1">
          <InventoryAlertCard lowStockProducts={lowStockProducts} />
        </div>
      </div>
    </div>
  );
}
