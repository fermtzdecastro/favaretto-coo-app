import type { Metadata } from "next";
import { BottomNav } from "@/components/ui/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Favaretto COO App",
  description: "Herramienta operativa y financiera para Favaretto",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="pb-20">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
