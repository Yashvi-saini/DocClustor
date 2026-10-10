"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Home as HomeIcon, Rocket, Lock, Search, ShieldCheck, Layers } from "lucide-react";
import SiteLoader from "../components/SiteLoader";

const navLinks = [
  { name: "Overview", href: "#top", icon: HomeIcon },
  { name: "Capabilities", href: "#capabilities", icon: Layers },
  { name: "Security Standards", href: "#security", icon: ShieldCheck },
  { name: "Get Started", href: "/signup", icon: Rocket },
];

const features = [
  {
    tag: "Workspaces",
    title: "Workspace-aware by design",
    body: "Every organization gets its own isolated workspace. Members, documents and conversations stay inside the boundary you define.",
    img: "/landing/workspace_aware.png",
    bg: "bg-white",
  },
  {
    tag: "RAG Assistant",
    title: "Ask your documents anything",
    body: "Retrieval-augmented answers grounded in your own files, with every response scoped to what the asking member is allowed to see.",
    img: "/landing/rag-bot.png",
    bg: "bg-[#F1F7FF]",
  },
  {
    tag: "Isolation",
    title: "Tenant isolation, end to end",
    body: "Prompts, embeddings and storage are segregated per tenant. No model is ever cross-trained on another organization's documents.",
    img: "/landing/tenant_isolation.png",
    bg: "bg-white",
  },
  {
    tag: "Locker",
    title: "A PIN-protected document locker",
    body: "Move your most sensitive files behind a second factor. Locked documents stay encrypted at rest until the PIN is verified.",
    img: "/landing/pinsecurity.png",
    bg: "bg-[#F1F7FF]",
  },
  {
    tag: "Access control",
    title: "Granular permissions",
    body: "Invite members, assign roles and review audit logs so you always know who opened, searched or shared what.",
    img: "/landing/granular.png",
    bg: "bg-white",
  },
];


function DocSheet({ className = "", accent = "#3B82F6" }: { className?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} fill="none" aria-hidden>
      <rect x="2" y="2" width="116" height="146" rx="10" fill="#fff" stroke="#DCE6F2" strokeWidth="2" />
      <rect x="16" y="18" width="34" height="8" rx="4" fill={accent} opacity=".9" />
      <rect x="16" y="40" width="88" height="5" rx="2.5" fill="#E3EBF5" />
      <rect x="16" y="54" width="76" height="5" rx="2.5" fill="#E3EBF5" />
      <rect x="16" y="68" width="84" height="5" rx="2.5" fill="#E3EBF5" />
      <rect x="16" y="82" width="52" height="5" rx="2.5" fill="#E3EBF5" />
      <rect x="16" y="106" width="88" height="26" rx="6" fill="#F1F7FF" />
      <rect x="24" y="115" width="40" height="5" rx="2.5" fill={accent} opacity=".4" />
    </svg>
  );
}

function FolderIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} fill="none" aria-hidden>
      <path d="M6 20a8 8 0 0 1 8-8h28l10 12h54a8 8 0 0 1 8 8v52a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V20Z" fill="#1E9BFF" opacity=".25" />
      <path d="M6 34a8 8 0 0 1 8-8h92a8 8 0 0 1 8 8v46a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8V34Z" fill="#3B82F6" />
      <rect x="18" y="56" width="40" height="6" rx="3" fill="#fff" opacity=".7" />
    </svg>
  );
}

function Floating({
  children,
  className,
  rotate = 0,
  delay = 0,
  amp = 10,
}: {
  children: React.ReactNode;
  className: string;
  rotate?: number;
  delay?: number;
  amp?: number;
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none select-none ${className}`}
      initial={{ opacity: 0, scale: 0.9, rotate }}
      animate={{ opacity: 1, scale: 1, rotate, y: [0, -amp, 0] }}
      transition={{
        opacity: { duration: 0.8, delay },
        scale: { duration: 0.8, delay },
        y: { duration: 6 + delay * 2, repeat: Infinity, ease: "easeInOut", delay },
      }}
    >
      {children}
    </motion.div>
  );
}

function HeroBackdrop() {
  const shadow = "";
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,#ffffff_30%,#EEF4FB_100%)]" />

      <Floating className="-left-8 top-20 w-28 sm:w-40 md:w-52" rotate={-12} delay={0.1}>
        <DocSheet className={`w-full ${shadow}`} />
      </Floating>
      <Floating className="-right-6 top-24 w-28 sm:w-40 md:w-56" rotate={10} delay={0.2}>
        <DocSheet accent="#003259" className={`w-full ${shadow}`} />
      </Floating>
      <Floating className="left-[4%] bottom-24 sm:bottom-10 w-16 sm:w-24 md:w-32" rotate={-6} delay={0.3}>
        <FolderIcon className={`w-full ${shadow}`} />
      </Floating>
      <Floating className="right-[3%] bottom-24 sm:bottom-12 w-24 sm:w-36 md:w-44" rotate={7} delay={0.35}>
        <DocSheet className={`w-full ${shadow}`} />
      </Floating>
      <Floating className="left-[16%] top-[58%] hidden md:block w-24" rotate={8} delay={0.5}>
        <DocSheet accent="#1E9BFF" className={`w-full ${shadow}`} />
      </Floating>
      <Floating className="right-[18%] top-[12%] hidden md:block w-24" rotate={-8} delay={0.6}>
        <DocSheet accent="#3B82F6" className={`w-full ${shadow}`} />
      </Floating>

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaderTimer = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(loaderTimer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="site-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100]"
          >
            <SiteLoader />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        id="top"
        className="min-h-screen bg-white text-slate-900 font-poppins selection:bg-[#1E9BFF]/20 selection:text-[#003259]"
      >
        <Link
          href="/"
          aria-label="DocClustor home"
          className="fixed left-3 top-3 sm:left-4 sm:top-4 z-50 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 border-[#1E9BFF] bg-white shadow-md transition-transform hover:scale-105"
        >
          <div className="relative h-6 w-6">
            <Image src="/logo(1).svg" alt="DocClustor Logo" fill className="object-contain" priority />
          </div>
        </Link>

        <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-row gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur sm:bottom-auto sm:left-4 sm:top-1/2 sm:-translate-x-0 sm:-translate-y-1/2 sm:flex-col sm:gap-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                aria-label={link.name}
                className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-[#003259] hover:text-white"
              >
                <Icon className="h-[18px] w-[18px]" />
                <span className="pointer-events-none absolute left-14 hidden sm:block whitespace-nowrap rounded-lg bg-[#003259] px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {link.name}
                </span>
              </a>
            );
          })}
        </nav>

        <div className="fixed right-3 top-3 sm:right-4 sm:top-4 z-50 flex items-center gap-1.5 sm:gap-2 font-poppins">
          <Link href="/login" className="rounded-xl border border-[#003259]/20 bg-white/80 px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold text-[#003259] backdrop-blur transition-colors hover:bg-[#003259]/5">
            Log In
          </Link>
          <Link href="/signup" className="rounded-xl bg-[#1E9BFF] px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold text-[#003259] shadow-md transition-colors hover:bg-[#1E9BFF]/90">
            Sign Up Now
          </Link>
        </div>

        <main>
          <section className="relative flex min-h-[100svh] items-center justify-center px-5 sm:px-6 pt-24 pb-28 lg:pt-0">
            <HeroBackdrop />
            <div className="relative z-10 mx-auto max-w-3xl text-center flex flex-col items-center">
              <h1 className="text-[2rem] sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#003259] leading-[1.1]">
                The smarter way to <span className="text-[#1E9BFF]">search your documents</span>
              </h1>
              <p className="mt-6 max-w-xl text-base md:text-lg text-slate-500 leading-relaxed">
                A secure workspace for sensitive data. Use retrieval-augmented answers without compromising privacy or access control.
              </p>

            </div>
          </section>

          <section id="capabilities" className="relative bg-white px-4 sm:px-6 pt-10 pb-20 md:pb-24 md:px-10">
            <div className="mx-auto max-w-5xl">
              <div className="mb-10 md:mb-14 max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-widest text-[#1E9BFF]">Capabilities</p>
                <h2 className="mt-3 text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-[#003259] leading-tight">
                  Everything your team needs, stacked in one place
                </h2>
              </div>

              <div className="flex flex-col gap-6">
                {features.map((f, i) => (
                  <div
                    key={f.title}
                    className="sticky top-[calc(4.5rem+var(--i)*0.75rem)] md:top-[calc(5rem+var(--i)*1.25rem)]"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <div
                      className={`${f.bg} grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 items-center rounded-2xl md:rounded-3xl border border-slate-200 p-4 sm:p-6 md:p-10 shadow-[0_20px_50px_-20px_rgba(0,50,89,0.25)]`}
                    >
                      <div>
                        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#1E9BFF]">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#003259] text-white text-[10px]">
                            {i + 1}
                          </span>
                          {f.tag}
                        </span>
                        <h3 className="mt-3 md:mt-4 text-xl sm:text-2xl md:text-3xl font-bold text-[#003259] leading-tight">{f.title}</h3>
                        <p className="mt-3 text-sm md:text-base text-slate-500 leading-relaxed">{f.body}</p>
                      </div>
                      <div className="relative aspect-[16/10] md:aspect-[4/3] w-full overflow-hidden rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50">
                        <Image src={f.img} alt={f.title} fill sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="security" className="bg-[#F1F7FF] px-5 sm:px-6 py-16 md:py-24 md:px-10">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003259] tracking-tight max-w-xl">
                Enterprise architecture. Compliant standards.
              </h2>
              <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {[
                  { icon: Layers, stat: "100%", title: "Data Segregation", body: "Queries run inside isolated tables. No model is cross-trained on multi-tenant document directories." },
                  { icon: Search, stat: "<100ms", title: "Query Retrieval Latency", body: "Optimized vector indexes and local credential checks happen before any AI engine is queried." },
                  { icon: Lock, stat: "AES-256", title: "Storage Protection", body: "Documents are encrypted at rest, with secondary PIN verification for the locker." },
                ].map(({ icon: Icon, stat, title, body }) => (
                  <div key={title} className="rounded-2xl border border-slate-200 bg-white p-7">
                    <Icon className="w-5 h-5 text-[#1E9BFF]" />
                    <div className="mt-4 text-4xl font-extrabold text-[#003259]">{stat}</div>
                    <h3 className="mt-2 font-bold text-sm text-[#003259]">{title}</h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="relative overflow-hidden bg-[#003259] px-5 sm:px-6 pt-12 md:pt-14 pb-0 md:px-10 text-white">
            <div className="relative z-10 mx-auto max-w-6xl">
              <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-4">
                {[
                  { title: "Company", links: [{ n: "About us" }, { n: "Careers" }, { n: "FAQs" }, { n: "Contact" }] },
                  { title: "Product", links: [{ n: "Capabilities", h: "#capabilities" }, { n: "Document Locker", h: "#capabilities" }, { n: "RAG Assistant", h: "#capabilities" }, { n: "Workspaces", h: "#capabilities" }] },
                  { title: "Resources", links: [{ n: "Documentation" }, { n: "Security", h: "#security" }, { n: "Changelog" }] },
                  { title: "Legal", links: [{ n: "Privacy Policy", h: "/privacy" }, { n: "Terms of Service", h: "/terms" }, { n: "Security Standards", h: "#security" }, { n: "Cookies" }] },
                ].map((col) => (
                  <div key={col.title}>
                    <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">{col.title}</h4>
                    <ul className="space-y-3">
                      {col.links.map((l) => (
                        <li key={l.n}>
                          {!l.h ? (
                            <span className="text-xs text-white/60">{l.n}</span>
                          ) : l.h.startsWith("/") ? (
                            <Link href={l.h} className="text-xs text-white/70 transition-colors hover:text-white">{l.n}</Link>
                          ) : (
                            <a href={l.h} className="text-xs text-white/70 transition-colors hover:text-white">{l.n}</a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-10 md:mt-12 flex flex-col gap-6 border-t border-white/15 pt-6 md:flex-row md:items-start md:justify-between">
                <div className="text-xs font-medium leading-relaxed text-white/80">
                  <p>DocClustor &mdash; secure document intelligence for teams.</p>
                  <p className="mt-3">&copy; {new Date().getFullYear()} DocClustor. All rights reserved.</p>
                </div>
              </div>
            </div>

            <div
              aria-hidden
              className="pointer-events-none select-none text-center font-extrabold leading-[0.8] tracking-tight whitespace-nowrap text-[14vw] mt-6 -mb-[0.1em] bg-gradient-to-b from-white/25 to-transparent bg-clip-text text-transparent"
            >
              DocClustor
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
