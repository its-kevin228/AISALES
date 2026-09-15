"use client";

import { useEffect } from "react";
import { X, ZoomIn, Download, ExternalLink, Receipt } from "lucide-react";

interface ReceiptLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  transactionRef?: string;
  operator?: string;
}

export function ReceiptLightbox({
  isOpen,
  onClose,
  imageUrl,
  transactionRef,
  operator,
}: ReceiptLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative max-w-3xl w-full bg-surface-1 border border-hairline rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 border-b border-hairline bg-surface-2/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono font-medium text-ink">
              Capture Reçu Mobile Money: {transactionRef || "Non spécifié"}
            </span>
            {operator && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-primary/10 text-primary border border-primary/20">
                {operator}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded text-ink-muted hover:text-ink hover:bg-surface-3 transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-ink-muted hover:text-ink hover:bg-surface-3 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40 min-h-[360px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Reçu ${transactionRef || "de paiement"}`}
              className="max-h-[70vh] w-auto object-contain rounded border border-hairline shadow-lg"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <Receipt className="w-12 h-12 text-ink-subtle mx-auto stroke-1" />
              <div className="text-xs font-mono text-ink-muted">
                Aucune image attachée à ce reçu
              </div>
              <div className="text-[11px] text-ink-subtle">
                Les données de transaction ont été transmises par message SMS ou webhook.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-hairline bg-surface-2/40 flex items-center justify-between text-xs font-mono text-ink-subtle">
          <span>Appuyez sur Échap pour fermer la visionneuse</span>
          <span>Inspection Anti-Fraude Omnisales</span>
        </div>
      </div>
    </div>
  );
}
