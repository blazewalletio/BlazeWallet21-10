import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BLAZE - Lightning Fast Crypto",
  description: "Set your finances on fire. Lightning fast crypto wallet with revolutionary design.",
  manifest: "/manifest.json",
  themeColor: "#f97316",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
          <main className="relative z-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
