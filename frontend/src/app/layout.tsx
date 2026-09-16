import type { Metadata } from "next";
import "./globals.css";
import { TopNavigation } from "@/components/layout/TopNavigation";

export const metadata: Metadata = {
  title: "OmniSales AI — WhatsApp Commerce Copilot",
  description: "Plateforme SaaS d'Automatisation Commerciale par IA Multimodale pour WhatsApp",
  icons: {
    icon: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-canvas text-ink font-sans antialiased min-h-screen flex flex-col">
        {/* Horizontal Top Navigation Bar */}
        <TopNavigation />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
