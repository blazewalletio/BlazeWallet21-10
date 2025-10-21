import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BLAZE Wallet - Secure DeFi Wallet",
  description: "Secure crypto wallet with DeFi features, biometric authentication, and cross-device sync.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BLAZE Wallet",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "BLAZE Wallet",
    title: "BLAZE Wallet - Secure DeFi Wallet",
    description: "Secure crypto wallet with DeFi features, biometric authentication, and cross-device sync.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <main className="relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}



