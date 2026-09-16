"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  Boxes, 
  CreditCard, 
  MessageSquare, 
  LayoutDashboard, 
  ArrowRight, 
  CornerDownLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sun, 
  Moon, 
  ExternalLink, 
  X,
  FileText,
  Tag
} from "lucide-react";
import { api } from "@/lib/api";
import { Order, Product } from "@/lib/types";
import { formatFCFA } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaletteCategory = "all" | "orders" | "products" | "actions" | "navigation";

interface ActionItem {
  id: string;
  type: "action";
  title: string;
  subtitle: string;
  category: "Action" | "Navigation";
  icon: React.ElementType;
  href?: string;
  perform?: () => void;
}

type PaletteItem = 
  | { type: "order"; data: Order }
  | { type: "product"; data: Product }
  | { type: "action"; data: ActionItem };

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PaletteCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load real data from PostgreSQL when palette opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        api.getOrders().catch(() => []),
        api.getProducts().catch(() => [])
      ]).then(([ord, prod]) => {
        setOrders(ord);
        setProducts(prod);
        setLoading(false);
      });
      // Focus search input
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Predefined quick actions & navigation
  const staticActions: ActionItem[] = useMemo(() => [
    {
      id: "nav-dash",
      type: "action",
      title: "Vue d'Ensemble",
      subtitle: "Accéder au tableau de bord exécutif et KPIs en direct",
      category: "Navigation",
      icon: LayoutDashboard,
      href: "/"
    },
    {
      id: "nav-inbox",
      type: "action",
      title: "Messagerie Live",
      subtitle: "Consulter les discussions WhatsApp et les transferts humains",
      category: "Navigation",
      icon: MessageSquare,
      href: "/inbox"
    },
    {
      id: "nav-orders",
      type: "action",
      title: "Commandes & Devis",
      subtitle: "Gérer le pipeline de commandes et les statuts de validation",
      category: "Navigation",
      icon: ShoppingBag,
      href: "/orders"
    },
    {
      id: "nav-inventory",
      type: "action",
      title: "Catalogue & Stocks",
      subtitle: "Consulter les articles et ajuster les niveaux de stocks",
      category: "Navigation",
      icon: Boxes,
      href: "/inventory"
    },
    {
      id: "nav-cashdesk",
      type: "action",
      title: "Caisse & Reçus",
      subtitle: "Inspecter et valider les preuves de paiement Mobile Money",
      category: "Navigation",
      icon: CreditCard,
      href: "/cashdesk"
    },
    {
      id: "act-theme",
      type: "action",
      title: "Bascule Thème Sombre / Clair",
      subtitle: "Alterner l'affichage entre le mode sombre Linear et clair Stripe",
      category: "Action",
      icon: Sun,
      perform: () => {
        const isDark = document.documentElement.classList.contains("dark");
        const next = isDark ? "light" : "dark";
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(next);
        localStorage.setItem("omnisales_theme", next);
      }
    }
  ], []);

  // Filter items based on query and activeCategory
  const filteredItems: PaletteItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: PaletteItem[] = [];

    // 1. Actions / Navigation
    if (activeCategory === "all" || activeCategory === "actions" || activeCategory === "navigation") {
      const matchedActions = staticActions.filter(a => {
        if (activeCategory === "actions" && a.category !== "Action") return false;
        if (activeCategory === "navigation" && a.category !== "Navigation") return false;
        if (!q) return true;
        return a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q);
      });
      matchedActions.forEach(a => result.push({ type: "action", data: a }));
    }

    // 2. Orders
    if (activeCategory === "all" || activeCategory === "orders") {
      const matchedOrders = orders.filter(o => {
        if (!q) return true;
        return (
          o.order_number.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q) ||
          (o.receipt_data?.operator || "").toLowerCase().includes(q) ||
          (o.receipt_data?.transaction_ref || "").toLowerCase().includes(q)
        );
      });
      matchedOrders.forEach(o => result.push({ type: "order", data: o }));
    }

    // 3. Products
    if (activeCategory === "all" || activeCategory === "products") {
      const matchedProducts = products.filter(p => {
        if (!q) return true;
        return (
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      });
      matchedProducts.forEach(p => result.push({ type: "product", data: p }));
    }

    return result;
  }, [query, activeCategory, orders, products, staticActions]);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    const listEl = listRef.current;
    if (listEl) {
      const activeEl = listEl.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Handle execution of item
  const handleSelect = (item: PaletteItem) => {
    onClose();
    if (item.type === "action") {
      if (item.data.href) {
        router.push(item.data.href);
      } else if (item.data.perform) {
        item.data.perform();
      }
    } else if (item.type === "order") {
      router.push("/orders");
    } else if (item.type === "product") {
      router.push("/inventory");
    }
  };

  // Keyboard controls (Up, Down, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  const currentItem = filteredItems[selectedIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-12 sm:pt-20 px-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-4xl bg-surface-1 border border-hairline-strong rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-hairline gap-3 bg-surface-1">
          <Search className="w-5 h-5 text-ink-subtle shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher une commande, un article SKU, un client ou une action..."
            className="w-full bg-transparent text-sm text-ink placeholder-ink-subtle focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-ink-subtle hover:text-ink p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-surface-2 text-ink-subtle rounded border border-hairline">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills (Tabs) */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-hairline bg-surface-2/40 overflow-x-auto select-none">
          {(
            [
              { key: "all", label: "Tous les résultats" },
              { key: "orders", label: "Commandes" },
              { key: "products", label: "Articles & Stocks" },
              { key: "actions", label: "Actions" },
              { key: "navigation", label: "Navigation" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface-2 text-ink-muted hover:text-ink border border-hairline"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Split View Content Body (Raycast Style) */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Results List (60%) */}
          <div 
            ref={listRef}
            className="w-full md:w-3/5 overflow-y-auto divide-y divide-hairline/60 p-2 space-y-0.5"
          >
            {loading ? (
              <div className="p-8 text-center text-xs text-ink-muted flex items-center justify-center gap-2 font-mono">
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Chargement des données...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center text-xs text-ink-muted">
                Aucun résultat pour <span className="font-semibold text-ink">"{query}"</span>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;

                if (item.type === "action") {
                  const Icon = item.data.icon;
                  return (
                    <div
                      key={`act-${item.data.id}`}
                      data-index={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-primary/15 border border-primary/30 text-ink" 
                          : "hover:bg-surface-2 text-ink-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded ${isSelected ? "bg-primary text-white" : "bg-surface-2 text-ink-subtle"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-xs font-medium truncate ${isSelected ? "text-ink" : "text-ink"}`}>
                            {item.data.title}
                          </span>
                          <span className="text-[11px] text-ink-muted truncate">
                            {item.data.subtitle}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-ink-subtle border border-hairline">
                        {item.data.category}
                      </span>
                    </div>
                  );
                }

                if (item.type === "order") {
                  const o = item.data;
                  const isPending = o.status === "pending_validation";
                  const isConfirmed = o.status === "confirmed";

                  return (
                    <div
                      key={`ord-${o.id}`}
                      data-index={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-primary/15 border border-primary/30 text-ink" 
                          : "hover:bg-surface-2 text-ink-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded ${
                          isPending ? "bg-accent-amber/20 text-accent-amber" :
                          isConfirmed ? "bg-accent-emerald/20 text-accent-emerald" :
                          "bg-surface-2 text-ink-subtle"
                        }`}>
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-ink">
                              {o.order_number}
                            </span>
                            {o.receipt_data?.operator && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-surface-3 text-ink-muted font-mono">
                                {o.receipt_data.operator}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-ink-muted truncate">
                            {formatFCFA(o.total_amount)} &bull; {o.lines?.length || 0} article(s)
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        isPending ? "bg-accent-amber/15 text-accent-amber" :
                        isConfirmed ? "bg-accent-emerald/15 text-accent-emerald" :
                        "bg-surface-3 text-ink-subtle"
                      }`}>
                        {o.status.replace("_", " ")}
                      </span>
                    </div>
                  );
                }

                if (item.type === "product") {
                  const p = item.data;
                  const isLow = p.stock_quantity <= 15;

                  return (
                    <div
                      key={`prod-${p.id}`}
                      data-index={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-primary/15 border border-primary/30 text-ink" 
                          : "hover:bg-surface-2 text-ink-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded ${isLow ? "bg-accent-rose/20 text-accent-rose" : "bg-primary/20 text-primary"}`}>
                          <Boxes className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-ink truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-ink-muted font-mono">
                            {p.code} &bull; {p.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 pl-2">
                        <span className="text-xs font-semibold text-ink tnum">
                          {formatFCFA(p.unit_price)}
                        </span>
                        <span className={`text-[10px] font-mono ${isLow ? "text-accent-rose font-semibold" : "text-ink-subtle"}`}>
                          {p.stock_quantity} en stock
                        </span>
                      </div>
                    </div>
                  );
                }

                return null;
              })
            )}
          </div>

          {/* Right Column: Live Context Preview Panel (40%) */}
          <div className="hidden md:flex w-2/5 border-l border-hairline bg-surface-2/30 p-5 flex-col justify-between overflow-y-auto">
            {currentItem ? (
              <div className="space-y-4">
                {/* Preview Header */}
                <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-subtle flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  <span>Aperçu Contextuel Direct</span>
                </div>

                {/* Product Detail Preview */}
                {currentItem.type === "product" && (
                  <div className="space-y-3 animate-in fade-in-50 duration-200">
                    <div className="p-3.5 rounded-lg border border-hairline bg-surface-1 space-y-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/15 text-primary uppercase font-semibold">
                        {currentItem.data.category}
                      </span>
                      <h4 className="text-sm font-semibold text-ink leading-snug">
                        {currentItem.data.name}
                      </h4>
                      <p className="font-mono text-xs text-ink-subtle">
                        Code SKU : <span className="text-ink">{currentItem.data.code}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded border border-hairline bg-surface-1">
                        <span className="text-[10px] text-ink-muted block uppercase font-mono">Prix Unitaire</span>
                        <span className="text-sm font-semibold text-ink tnum">
                          {formatFCFA(currentItem.data.unit_price)}
                        </span>
                      </div>
                      <div className="p-3 rounded border border-hairline bg-surface-1">
                        <span className="text-[10px] text-ink-muted block uppercase font-mono">Niveau Stock</span>
                        <span className={`text-sm font-semibold tnum ${
                          currentItem.data.stock_quantity <= 15 ? "text-accent-rose font-bold" : "text-accent-emerald"
                        }`}>
                          {currentItem.data.stock_quantity} unités
                        </span>
                      </div>
                    </div>

                    {currentItem.data.stock_quantity <= 15 && (
                      <div className="p-2.5 rounded bg-accent-rose/10 border border-accent-rose/30 flex items-center gap-2 text-accent-rose text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Alerte réapprovisionnement requise</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Detail Preview */}
                {currentItem.type === "order" && (
                  <div className="space-y-3 animate-in fade-in-50 duration-200">
                    <div className="p-3.5 rounded-lg border border-hairline bg-surface-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-ink">
                          {currentItem.data.order_number}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold bg-primary/15 text-primary">
                          {currentItem.data.status}
                        </span>
                      </div>
                      <div className="pt-1">
                        <span className="text-[10px] text-ink-muted block uppercase font-mono">Montant Total</span>
                        <span className="text-lg font-bold text-ink tnum">
                          {formatFCFA(currentItem.data.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Receipt Preview if available */}
                    {currentItem.data.receipt_data && (
                      <div className="p-3 rounded-lg border border-hairline bg-surface-1 space-y-1.5">
                        <span className="text-[10px] uppercase font-mono font-semibold text-ink-muted block">
                          Preuve Mobile Money
                        </span>
                        <div className="text-xs space-y-1 font-mono">
                          <div className="flex justify-between">
                            <span className="text-ink-subtle">Opérateur :</span>
                            <span className="text-ink font-semibold">{currentItem.data.receipt_data.operator || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ink-subtle">Réf Tx :</span>
                            <span className="text-ink">{currentItem.data.receipt_data.transaction_ref || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Detail Preview */}
                {currentItem.type === "action" && (
                  <div className="space-y-3 animate-in fade-in-50 duration-200">
                    <div className="p-4 rounded-lg border border-hairline bg-surface-1 space-y-2">
                      <h4 className="text-sm font-semibold text-ink">
                        {currentItem.data.title}
                      </h4>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        {currentItem.data.subtitle}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center text-xs text-ink-subtle">
                Sélectionnez un élément pour voir l'aperçu
              </div>
            )}

            {/* Preview Action CTA Button */}
            {currentItem && (
              <button
                onClick={() => handleSelect(currentItem)}
                className="w-full mt-4 py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Accéder directement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Bar: Keyboard Shortcuts (Linear Style) */}
        <div className="px-4 py-2.5 border-t border-hairline bg-surface-2/60 flex items-center justify-between text-[11px] text-ink-muted font-mono select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-hairline text-ink text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-hairline text-ink text-[10px]">↓</kbd>
              <span>Naviguer</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-hairline text-ink text-[10px]">↵</kbd>
              <span>Sélectionner</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-3 border border-hairline text-ink text-[10px]">ESC</kbd>
              <span>Fermer</span>
            </span>
          </div>

          <div>
            <span>{filteredItems.length} résultat(s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
