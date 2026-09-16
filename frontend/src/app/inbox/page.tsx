"use client";

import { useState } from "react";
import { ConversationList, ConversationItem } from "@/components/inbox/ConversationList";
import { ChatTimeline, ChatMessage } from "@/components/inbox/ChatTimeline";
import { CustomerProfileDrawer } from "@/components/inbox/CustomerProfileDrawer";

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    id: "conv-1",
    name: "M. Kouamé (Chantier Cocody)",
    phone: "+225 07 08 09 10 11",
    lastMessage: "Il vous reste 15 cartons de carreaux 60x60 et 3 sacs de colle ?",
    timestamp: "17:34",
    status: "bot",
  },
  {
    id: "conv-2",
    name: "Quincaillerie Moderne",
    phone: "+225 01 02 03 04 05",
    lastMessage: "Je vous envoie le reçu de virement Wave pour la commande.",
    timestamp: "16:50",
    status: "human_handover",
  },
  {
    id: "conv-3",
    name: "Entreprise BTP Bamba",
    phone: "+225 05 12 34 56 78",
    lastMessage: "Bonjour, quel est votre meilleur tarif pour 100 fers de 12 ?",
    timestamp: "14:15",
    status: "dispute",
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  "conv-1": [
    {
      id: "m-1",
      sender: "customer",
      content: "Salut ! Il vous reste 15 cartons de carreaux 60x60 et 3 sacs de colle ?",
      mediaType: "text",
      time: "17:30",
    },
    {
      id: "m-2",
      sender: "ai_agent",
      content: "Bonjour M. Kouamé ! Oui, les carreaux 60x60 sont bien disponibles en stock (85 cartons restants à 9 500 FCFA le carton) et la colle carrelage 25kg est à 4 500 FCFA le sac (40 sacs disponibles). Souhaitez-vous que je vous établisse un devis pour 15 cartons et 3 sacs ?",
      mediaType: "text",
      time: "17:31",
    },
    {
      id: "m-3",
      sender: "customer",
      content: "Oui faites-moi le total directement avec la livraison à Cocody.",
      mediaType: "audio",
      time: "17:33",
    },
    {
      id: "m-4",
      sender: "ai_agent",
      mediaType: "quote",
      quoteData: {
        items: [
          { name: "Carreaux Grès Cérame 60x60 (15 cartons)", qty: 15, total: "142 500 FCFA" },
          { name: "Colle Carrelage C2 25kg (3 sacs)", qty: 3, total: "13 500 FCFA" },
        ],
        total: "156 000 FCFA",
      },
      time: "17:34",
    },
  ],
  "conv-2": [
    {
      id: "m-201",
      sender: "customer",
      content: "Je vous envoie le reçu de virement Wave pour la commande CMD-2026-0042.",
      mediaType: "text",
      time: "16:48",
    },
    {
      id: "m-202",
      sender: "human_agent",
      content: "Bien reçu ! Notre responsable de caisse vérifie la transaction Wave à l'instant.",
      mediaType: "text",
      time: "16:50",
    },
  ],
  "conv-3": [
    {
      id: "m-301",
      sender: "customer",
      content: "Bonjour, quel est votre meilleur tarif pour 100 fers de 12 ?",
      mediaType: "text",
      time: "14:15",
    },
  ],
};

export default function InboxPage() {
  const [selectedConvId, setSelectedConvId] = useState("conv-1");
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const currentConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const currentMessages = messages[selectedConvId] || [];

  const handleToggleBot = () => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId
          ? { ...c, status: c.status === "bot" ? "human_handover" : "bot" }
          : c
      )
    );
  };

  const handleSendMessage = (text: string) => {
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "human_agent",
      content: text,
      mediaType: "text",
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMessage],
    }));

    // Update last message in conversation item
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId ? { ...c, lastMessage: text, timestamp: "A l'instant" } : c
      )
    );
  };

  return (
    <div className="h-[calc(100vh-11rem)] min-h-[640px] rounded-xl border border-hairline/90 shadow-xs overflow-hidden flex bg-surface-1">
      {/* Left List of Conversations */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedConvId}
        onSelect={setSelectedConvId}
      />

      {/* Center Chat Timeline Feed */}
      <ChatTimeline
        customerName={currentConv.name}
        customerPhone={currentConv.phone}
        isBotActive={currentConv.status === "bot"}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
      />

      {/* Right Drawer with Customer Info and Handover Toggle */}
      <CustomerProfileDrawer
        name={currentConv.name}
        phone={currentConv.phone}
        isBotActive={currentConv.status === "bot"}
        onToggleBot={handleToggleBot}
      />
    </div>
  );
}
