"use client";

import { useState } from "react";
import { Send, Mic, Paperclip, Bot, User, CheckCheck } from "lucide-react";
import { AudioVoicePlayer } from "./AudioVoicePlayer";
import clsx from "clsx";

export interface ChatMessage {
  id: string;
  sender: "customer" | "ai_agent" | "human_agent";
  content?: string;
  mediaType?: "text" | "audio" | "image" | "quote";
  mediaUrl?: string;
  quoteData?: {
    items: { name: string; qty: number; total: string }[];
    total: string;
  };
  time: string;
}

interface ChatTimelineProps {
  customerName: string;
  customerPhone: string;
  isBotActive: boolean;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export function ChatTimeline({
  customerName,
  customerPhone,
  isBotActive,
  messages,
  onSendMessage,
}: ChatTimelineProps) {
  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <div className="flex-1 flex flex-col bg-canvas h-full overflow-hidden">
      {/* Chat Top Banner */}
      <div className="h-14 border-b border-hairline bg-surface-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-3 border border-hairline-strong flex items-center justify-center text-xs font-mono font-semibold text-ink">
            {customerName.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-semibold text-ink flex items-center gap-2">
              <span>{customerName}</span>
              <span className="text-[10px] font-mono text-ink-subtle">({customerPhone})</span>
            </div>
            <div className="text-[10px] font-mono text-ink-subtle flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isBotActive ? "bg-primary" : "bg-accent-amber"}`} />
              <span>{isBotActive ? "Orchestration Bot Active" : "Contrôle Humain en cours"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Feed Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isCustomer = msg.sender === "customer";
          const isAI = msg.sender === "ai_agent";

          return (
            <div
              key={msg.id}
              className={clsx("flex flex-col max-w-[75%]", isCustomer ? "self-start" : "self-end ml-auto items-end")}
            >
              {/* Sender label */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-subtle mb-1">
                {isCustomer && <span>Client</span>}
                {isAI && (
                  <span className="flex items-center gap-1 text-primary">
                    <Bot className="w-2.5 h-2.5" />
                    <span>Copilot IA</span>
                  </span>
                )}
                {!isCustomer && !isAI && (
                  <span className="flex items-center gap-1 text-ink">
                    <User className="w-2.5 h-2.5" />
                    <span>Kevin (Vendeur)</span>
                  </span>
                )}
                <span>· {msg.time}</span>
              </div>

              {/* Message Bubble Content */}
              <div
                className={clsx(
                  "p-3 rounded text-xs leading-relaxed border shadow-sm",
                  isCustomer
                    ? "bg-surface-1 border-hairline text-ink"
                    : isAI
                    ? "bg-surface-2 border-hairline-strong text-ink"
                    : "bg-primary/10 border-primary/30 text-ink"
                )}
              >
                {msg.mediaType === "audio" ? (
                  <div className="space-y-2">
                    <AudioVoicePlayer duration="0:24" />
                    {msg.content && (
                      <p className="text-[11px] text-ink-muted italic border-t border-hairline pt-1.5">
                        Transcription : "{msg.content}"
                      </p>
                    )}
                  </div>
                ) : msg.mediaType === "quote" && msg.quoteData ? (
                  <div className="space-y-2 font-mono">
                    <div className="font-semibold text-ink text-xs border-b border-hairline pb-1">
                      Devis Proforma Émis :
                    </div>
                    {msg.quoteData.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span>• {it.qty}x {it.name}</span>
                        <span className="text-ink font-semibold">{it.total}</span>
                      </div>
                    ))}
                    <div className="pt-1.5 border-t border-hairline flex items-center justify-between font-bold text-xs text-primary">
                      <span>Total</span>
                      <span>{msg.quoteData.total}</span>
                    </div>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>

              {/* Delivery Receipt Ticks */}
              {!isCustomer && (
                <div className="flex items-center gap-1 text-[10px] text-accent-sky mt-0.5 self-end">
                  <CheckCheck className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Human Response Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-hairline bg-surface-1">
        <div className="flex items-center gap-2 bg-surface-2 border border-hairline rounded p-2 focus-within:border-primary/60 transition-colors">
          <input
            type="text"
            placeholder={isBotActive ? "Reprendre la main et répondre directement..." : "Écrire un message WhatsApp au client..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent text-xs text-ink placeholder-ink-subtle focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-3 py-1.5 rounded bg-primary text-white text-xs font-medium hover:bg-primary-hover disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <span>Envoyer</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>
    </div>
  );
}
