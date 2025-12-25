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
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

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
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
