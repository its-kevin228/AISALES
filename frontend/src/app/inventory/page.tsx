"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { api } from "@/lib/api";
import { ProductTable } from "@/components/inventory/ProductTable";
import { QuickStockEditModal } from "@/components/inventory/QuickStockEditModal";
import { RefreshCw, Package, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      console.error("Failed to load inventory:", err);
      setError(err.message || "Erreur de chargement du catalogue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveStock = async (productId: string, newStock: number) => {
    try {
      setIsSaving(true);
      const updated = await api.updateStock(productId, newStock);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updated : p))
      );
      setEditingProduct(null);
    } catch (err: any) {
      alert(`Erreur de mise a jour du stock: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const totalSKUs = products.length;
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;
  const lowStockCount = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
  ).length;
  const totalStockValue = products.reduce(
    (acc, curr) => acc + curr.unit_price * curr.stock_quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink flex items-center gap-2.5">
            <Package className="w-5 h-5 text-primary" />
            <span>Catalogue et Gestion des Stocks</span>
          </h1>
          <p className="text-xs text-ink-subtle mt-1 font-mono">
            Synchronisation temps réel du catalogue B2B avec l'agent IA WhatsApp
          </p>
        </div>

        <button
          onClick={fetchProducts}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-ink text-xs font-mono transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-xl border border-hairline/90 bg-surface-1 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-ink-subtle uppercase tracking-wider">Références Actives</span>
            <div className="text-2xl font-bold font-mono text-ink tnum">{totalSKUs}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-hairline/90 bg-surface-1 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-ink-subtle uppercase tracking-wider">Stocks Critiques</span>
            <div className="text-2xl font-bold font-mono text-accent-amber tnum">{lowStockCount}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-amber/10 border border-accent-amber/20 flex items-center justify-center text-accent-amber">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-hairline/90 bg-surface-1 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-ink-subtle uppercase tracking-wider">Ruptures Totales</span>
            <div className="text-2xl font-bold font-mono text-accent-rose tnum">{outOfStockCount}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent-rose/10 border border-accent-rose/20 flex items-center justify-center text-accent-rose">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-hairline/90 bg-surface-1 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono text-ink-subtle uppercase tracking-wider">Valeur Immobilisée</span>
            <div className="text-2xl font-bold font-mono text-ink tnum">{formatFCFA(totalStockValue)}</div>
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

      {/* Product Table */}
      <ProductTable
        products={products}
        onEditStock={(product) => setEditingProduct(product)}
      />

      {/* Quick Stock Edit Modal */}
      <QuickStockEditModal
        product={editingProduct}
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveStock}
        isSaving={isSaving}
      />
    </div>
  );
}
