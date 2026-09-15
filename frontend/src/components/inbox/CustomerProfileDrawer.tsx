"use client";

import { User, Phone, MapPin, ShoppingBag, ToggleLeft, ToggleRight, ShieldAlert } from "lucide-react";
import clsx from "clsx";

interface CustomerProfileDrawerProps {
  name: string;
  phone: string;
  address?: string;
  isBotActive: boolean;
  onToggleBot: () => void;
}

export function CustomerProfileDrawer({
  name,
  phone,
  address = "Abidjan, Cocody Riviera 3",
  isBotActive,
  onToggleBot,
}: CustomerProfileDrawerProps) {
  return (
    <div className="w-72 border-l border-hairline bg-surface-1 p-4 flex flex-col justify-between h-full">
      <div className="space-y-5">
        {/* Customer Header */}
        <div className="text-center pb-4 border-b border-hairline">
          <div className="w-12 h-12 rounded-full bg-surface-3 border border-hairline-strong mx-auto flex items-center justify-center text-sm font-mono font-bold text-ink mb-2">
            {name.charAt(0)}
          </div>
          <h3 className="text-sm font-semibold text-ink">{name}</h3>
          <p className="text-xs font-mono text-ink-subtle">{phone}</p>
        </div>

        {/* Handover Toggle Section */}
        <div className="p-3 rounded border border-hairline bg-surface-2/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Bascule Handover</span>
            <button
              onClick={onToggleBot}
              className={clsx(
                "p-1 rounded transition-colors flex items-center gap-1",
                isBotActive ? "text-primary" : "text-accent-amber"
              )}
            >
              {isBotActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
            </button>
          </div>
          <p className="text-[11px] text-ink-muted leading-tight">
            {isBotActive
              ? "L'IA gère les réponses automatiquement. Cliquez pour reprendre la main."
              : "Le bot est en pause. Vous dialoguez directement avec le client."}
          </p>
        </div>

        {/* Details List */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2.5 text-ink-muted">
            <MapPin className="w-3.5 h-3.5 text-ink-subtle mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-mono uppercase text-ink-subtle">Adresse de livraison</div>
              <div className="text-ink">{address}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-ink-muted">
            <ShoppingBag className="w-3.5 h-3.5 text-ink-subtle mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-mono uppercase text-ink-subtle">Commandes cumulées</div>
              <div className="text-ink font-mono font-medium">3 commandes · 345 000 FCFA</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div className="p-2.5 rounded bg-surface-2 border border-hairline text-[10px] font-mono text-ink-subtle flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-accent-amber flex-shrink-0" />
        <span>Garantie Human-in-the-Loop active sur ce compte.</span>
      </div>
    </div>
  );
}
