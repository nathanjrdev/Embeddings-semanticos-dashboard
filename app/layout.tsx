import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel de Embeddings | VoyageAI",
  description:
    "Visualização interativa do pipeline de chunking, embedding, normalização L2 e redução de dimensionalidade."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[url('/download.jpg')] bg-cover bg-center min-h-screen relative">
        {/* Overlay radial com efeito de “gladiador” (mantém a escurecida transparente) */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.05),transparent_45%),radial-gradient(circle_at_80%_100%,rgba(255,255,255,0.04),transparent_40%)]" />
        {children}
      </body>
    </html>
  );
}