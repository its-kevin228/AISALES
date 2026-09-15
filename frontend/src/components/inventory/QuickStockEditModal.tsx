"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { X, Check, Plus, Minus, AlertTriangle, Package } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

interface QuickStockEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, newStock: number) => Promise<void>;
  isSaving: boolean;
}

export function QuickStockEditModal({
  product,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: QuickStockEditModalProps) {
  const [stock, setStock] = useState<number>(0);

  useEffect(() => {
    if (product) {
      setStock(product.stock_quantity);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && product) {
        e.preventDefault();
        onSave(product.id, stock);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onSave, product, stock]);

  if (!isOpen || !product) return null;

  const handleAdjust = (delta: number) => {
    setStock((prev) => Math.max(0, prev + delta));
  };

  const isLowStock = stock <= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface-1 border border-hairline rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-hairline bg-surface-2/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-ink-subtle uppercase tracking-wider">
                Ajustement de Stock
              </span>
              <h2 className="text-sm font-semibold text-ink leading-tight truncate max-w-[260px]">
                {product.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-muted hover:text-ink hover:bg-surface-3 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* SKU and Price info */}
          <div className="flex items-center justify-between p-3 rounded border border-hairline bg-surface-2/30 text-xs">
            <div>
              <span className="text-ink-subtle font-mono text-[10px] uppercase block">Code SKU</span>
              <span className="font-mono font-semibold text-ink">{product.code}</span>
            </div>
            <div className="text-right">
              <span className="text-ink-subtle font-mono text-[10px] uppercase block">Prix Unitaire</span>
              <span className="font-mono font-semibold text-ink tnum">{formatFCFA(product.unit_price)}</span>
            </div>
          </div>

          {/* Current Stock vs New Stock Counter */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-ink-subtle uppercase tracking-wider block">
              Quantité Disponible en Entrepôt
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAdjust(-10)}
                className="px-2.5 py-2 rounded border border-hairline bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink font-mono text-xs transition-colors"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(-1)}
                className="p-2 rounded border border-hairline bg-surface-2 hover:bg-surface-3 text-ink transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 bg-surface-2 border border-hairline rounded py-2 px-3 text-center text-lg font-mono font-bold text-ink focus:outline-none focus:border-primary transition-colors tnum"
              />
              <button
                type="button"
                onClick={() => handleAdjust(1)}
                className="p-2 rounded border border-hairline bg-surface-2 hover:bg-surface-3 text-ink transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleAdjust(10)}
                className="px-2.5 py-2 rounded border border-hairline bg-surface-2 hover:bg-surface-3 text-ink-muted hover:text-ink font-mono text-xs transition-colors"
              >
                +10
              </button>
            </div>
          </div>

          {/* Low stock warning */}
          {isLowStock && (
            <div className="p-3 rounded border border-accent-amber/30 bg-accent-amber/10 flex items-center gap-2.5 text-accent-amber text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Niveau critique: cette quantité déclenchera une alerte de réapprovisionnement.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-hairline bg-surface-2/40 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-3 py-1.5 rounded border border-hairline text-xs font-mono text-ink-muted hover:text-ink hover:bg-surface-3 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onSave(product.id, stock)}
            disabled={isSaving}
            className="px-4 py-1.5 rounded bg-primary hover:bg-primary-hover active:scale-95 text-xs font-mono font-semibold text-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? "Mise a jour..." : "Enregistrer"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
