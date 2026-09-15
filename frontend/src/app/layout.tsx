import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "OmniSales AI — WhatsApp Commerce Copilot",
  description: "Plateforme SaaS d'Automatisation Commerciale par IA Multimodale pour WhatsApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-canvas text-ink antialiased flex h-screen overflow-hidden">
        {/* Left Workbench Sidebar */}
        <Sidebar />
        
        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-canvas">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
