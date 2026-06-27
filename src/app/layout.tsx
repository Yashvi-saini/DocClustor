import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "DocClustor - Document Management & Organization Platform",
    template: "%s | DocClustor",
  },
  description: "DocClustor is a powerful document management and organization platform that helps you store, organize, and collaborate on documents efficiently. Secure, fast, and user-friendly.",
  keywords: ["document management", "document organization", "file storage", "collaboration", "cloud storage", "document clustering", "RAG", "document search"],
  authors: [{ name: "DocClustor Team" }],
  creator: "DocClustor",
  publisher: "DocClustor",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://docclustor.me'),
    alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://docclustor.me'),
    title: "DocClustor - Document Management & Organization Platform",
    description: "DocClustor is a powerful document management and organization platform that helps you store, organize, and collaborate on documents efficiently.",
    siteName: "DocClustor",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocClustor - Document Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocClustor - Document Management & Organization Platform",
    description: "DocClustor is a powerful document management and organization platform that helps you store, organize, and collaborate on documents efficiently.",
    images: ["/og-image.png"],
    creator: "@docclustor",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

import { WorkspaceProvider } from "@/context/WorkspaceContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <WorkspaceProvider>
          {children}
        </WorkspaceProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
