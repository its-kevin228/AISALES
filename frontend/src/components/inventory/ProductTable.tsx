"use client";

import { useState } from "react";
import { Product } from "@/lib/types";
import { formatFCFA } from "@/lib/utils";
import { Search, Edit3, AlertCircle, CheckCircle2, Package, XCircle } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onEditStock: (product: Product) => void;
}

export function ProductTable({ products, onEditStock }: ProductTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher produit, code SKU..."
            className="w-full bg-surface-2/60 border border-hairline rounded pl-9 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-subtle focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
              categoryFilter === "all"
                ? "bg-surface-3 text-ink border border-hairline font-semibold"
                : "text-ink-muted hover:text-ink hover:bg-surface-2"
            }`}
          >
            Tous les rayons ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded text-xs font-mono capitalize transition-colors ${
                categoryFilter === cat
                  ? "bg-primary/20 text-primary border border-primary/30 font-semibold"
                  : "text-ink-muted hover:text-ink hover:bg-surface-2"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-hairline rounded bg-surface-1 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-surface-2/40 text-[11px] font-mono text-ink-subtle uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Code SKU</th>
                <th className="py-2.5 px-4 font-semibold">Désignation Produit</th>
                <th className="py-2.5 px-4 font-semibold">Rayon</th>
                <th className="py-2.5 px-4 font-semibold text-right">Prix Unitaire</th>
                <th className="py-2.5 px-4 font-semibold text-center">Niveau Stock</th>
                <th className="py-2.5 px-4 font-semibold text-center">Disponibilité</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-ink-subtle">
                    Aucun produit trouvé pour les filtres actifs.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isOutOfStock = product.stock_quantity === 0;
                  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-surface-2/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-ink">
                        {product.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-ink">{product.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-2 text-ink-muted border border-hairline capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-ink tnum">
                        {formatFCFA(product.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded inline-block tnum ${
                            isOutOfStock
                              ? "bg-accent-rose/10 text-accent-rose border border-accent-rose/30"
                              : isLowStock
                              ? "bg-accent-amber/10 text-accent-amber border border-accent-amber/30"
                              : "bg-surface-2 text-ink border border-hairline"
                          }`}
                        >
                          {product.stock_quantity} unités
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-rose">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rupture</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-amber">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Critique</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-emerald">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Disponible</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onEditStock(product)}
                          className="px-2.5 py-1 rounded bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-ink text-[11px] font-mono transition-colors inline-flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Ajuster</span>
                        </button>
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
