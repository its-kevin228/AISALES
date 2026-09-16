"use client";

import { useState } from "react";
import { Search, Bot, UserCheck, AlertCircle } from "lucide-react";
import clsx from "clsx";

export interface ConversationItem {
  id: string;
  phone: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  status: "bot" | "human_handover" | "dispute";
  unreadCount?: number;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const [filter, setFilter] = useState<"all" | "bot" | "human" | "dispute">("all");
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) => {
    if (filter === "bot" && c.status !== "bot") return false;
    if (filter === "human" && c.status !== "human_handover") return false;
    if (filter === "dispute" && c.status !== "dispute") return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.phone.includes(search)) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-80 border-r border-hairline bg-surface-1 flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-hairline space-y-2.5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-surface-2 border border-hairline text-xs text-ink-muted">
          <Search className="w-3.5 h-3.5 text-ink-subtle" />
          <input
            type="text"
            placeholder="Filtrer conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-ink placeholder-ink-subtle focus:outline-none w-full"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
          <button
            onClick={() => setFilter("all")}
            className={clsx(
              "px-2 py-0.5 rounded transition-colors",
              filter === "all" ? "bg-surface-3 text-ink border border-hairline-strong" : "text-ink-subtle hover:text-ink"
            )}
          >
            Toutes ({conversations.length})
          </button>
          <button
            onClick={() => setFilter("human")}
            className={clsx(
              "px-2 py-0.5 rounded transition-colors flex items-center gap-1",
              filter === "human" ? "bg-surface-3 text-accent-amber border border-hairline-strong" : "text-ink-subtle hover:text-ink"
            )}
          >
            <UserCheck className="w-3 h-3 text-accent-amber" />
            <span>Reprise</span>
          </button>
          <button
            onClick={() => setFilter("bot")}
            className={clsx(
              "px-2 py-0.5 rounded transition-colors flex items-center gap-1",
              filter === "bot" ? "bg-surface-3 text-primary border border-hairline-strong" : "text-ink-subtle hover:text-ink"
            )}
          >
            <Bot className="w-3 h-3 text-primary" />
            <span>Bot</span>
          </button>
        </div>
      </div>

      {/* Conversation Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-hairline">
        {filtered.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={clsx(
                "p-3 cursor-pointer transition-colors text-left flex flex-col gap-1.5",
                isSelected 
                  ? "bg-surface-2 shadow-xs text-ink" 
                  : "hover:bg-surface-2/60 text-ink-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-surface-2 border border-hairline flex items-center justify-center text-xs font-mono font-medium text-ink">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-ink leading-tight">{item.name}</div>
                    <div className="text-[10px] font-mono text-ink-subtle">{item.phone}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-ink-subtle">{item.timestamp}</span>
              </div>

              <p className="text-xs text-ink-muted line-clamp-1 pl-8">
                {item.lastMessage}
              </p>

              <div className="flex items-center justify-between pl-8 pt-0.5">
                {item.status === "bot" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                    <Bot className="w-2.5 h-2.5" />
                    <span>IA Active</span>
                  </span>
                )}
                {item.status === "human_handover" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-amber bg-accent-amber/10 px-1.5 py-0.2 rounded border border-accent-amber/20">
                    <UserCheck className="w-2.5 h-2.5" />
                    <span>Reprise Humaine</span>
                  </span>
                )}
                {item.status === "dispute" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-accent-rose bg-accent-rose/10 px-1.5 py-0.2 rounded border border-accent-rose/20">
                    <AlertCircle className="w-2.5 h-2.5" />
                    <span>Litige Détecté</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
