"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  ArrowRight, 
  Menu, 
  X 
} from "lucide-react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-poppins selection:bg-[#1E9BFF]/20 selection:text-[#003259]">
      
      {/* 1. GLASSMORPHISM STICKY NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-6 md:px-8">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="relative w-9 h-9 shrink-0">
              <Image 
                src="/logo(1).svg" 
                alt="DocClustor Logo" 
                fill 
                className="object-contain" 
                priority 
              />
            </div>
            <div className="relative w-28 h-6 shrink-0">
              <Image 
                src="/DocClustor.svg" 
                alt="DocClustor Logo Text" 
                fill 
                className="object-contain" 
                priority 
              />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#capabilities" className="text-sm font-medium text-slate-500 hover:text-[#003259] transition-colors">
              Capabilities
            </a>
            <a href="#security" className="text-sm font-medium text-slate-500 hover:text-[#003259] transition-colors">
              Security Standards
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-500 hover:text-[#003259] transition-colors">
              Pricing
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-[#003259] transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white bg-[#003259] hover:bg-[#002440] transition-colors rounded-lg shadow-sm"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden p-2 text-slate-600 hover:text-[#003259] transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 top-[80px] z-40 border-b border-slate-200 bg-white shadow-lg md:hidden p-6 flex flex-col gap-5"
          >
            <a 
              href="#capabilities" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-600 hover:text-[#003259] py-1 border-b border-slate-100"
            >
              Capabilities
            </a>
            <a 
              href="#security" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-600 hover:text-[#003259] py-1 border-b border-slate-100"
            >
              Security Standards
            </a>
            <a 
              href="#pricing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-slate-600 hover:text-[#003259] py-1 border-b border-slate-100"
            >
              Pricing
            </a>
            <div className="flex flex-col gap-3 pt-2">
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg"
              >
                Log In
              </Link>
              <Link 
                href="/signup" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#003259] rounded-lg"
              >
                Sign Up Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 2. HERO SECTION - SPLIT LAYOUT */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left side text and actions */}
            <div className="lg:col-span-6 text-left flex flex-col items-start">

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#003259] leading-[1.15] font-poppins">
                Secure Workspace-Aware <br />
                <span className="text-[#1E9BFF]">RAG & Document Locker</span>
              </h1>

              <p className="mt-6 text-base md:text-lg text-slate-500 leading-relaxed font-normal max-w-xl">
                A high performance workspace for sensitive data. Leverage the power of Retrieval Augmented Generation without compromising privacy or security.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-row items-center gap-4 w-full sm:w-auto">
                <Link 
                  href="/signup" 
                  className="px-6 py-3.5 text-sm font-bold text-white bg-[#003259] hover:bg-[#002440] transition-colors rounded-lg shadow-sm"
                >
                  Create Vault
                </Link>
                <a 
                  href="#capabilities" 
                  className="px-6 py-3.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors rounded-lg"
                >
                  Watch Demo
                </a>
              </div>

            </div>

            {/* Right side illustration - CLIP PATH INSET ANIMATION */}
            <div className="lg:col-span-6 w-full">
              <motion.div 
                initial={{ clipPath: "inset(10% 10% 10% 10% round 24px)", opacity: 0 }}
                animate={{ clipPath: "inset(0% 0% 0% 0% round 16px)", opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden bg-slate-50 border border-slate-200 rounded-2xl shadow-lg p-2"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image 
                    src="/landing/hero.png" 
                    alt="DocClustor Workspace Platform Interface Layout" 
                    fill 
                    className="object-cover rounded-xl"
                    priority
                  />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>


      {/* 3. BENTO GRID CAPABILITIES SECTION - SLEEK DARK BACKDROP */}
      <section id="capabilities" className="py-24 md:py-32 bg-[#00172B] text-white">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          
          {/* Section Header */}
          <div className="max-w-3xl mb-16 md:mb-20 text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Capabilities
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            
            {/* CARD 1: Workspace-Aware RAG */}
            <div className="md:col-span-4 flex flex-col justify-between overflow-hidden border border-white/10 rounded-2xl bg-[#003259] transition-all duration-300 hover:border-[#1E9BFF] hover:shadow-[0_0_30px_rgba(30,155,255,0.25)] hover:-translate-y-1 group p-8 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
                
                {/* Text Side */}
                <div className="lg:col-span-5 flex flex-col justify-center text-left">
                  <h3 className="text-xl font-bold text-white mb-3">
                    Intelligent AI RAG Bot
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Interact with your private data using our state-of-the-art Retrieval-Augmented Generation agent. Answers only grounded in your documents.
                  </p>
                </div>

                {/* Screenshot Side */}
                <div className="lg:col-span-7 w-full">
                  <div className="bg-white rounded-xl p-4 border border-white/10 flex items-center justify-center aspect-[1.6] relative overflow-hidden shadow-md">
                    <Image 
                      src="/landing/rag-bot.png" 
                      alt="AI RAG Bot chat application screenshot view" 
                      fill 
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" 
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* CARD 2: PIN Security  */}
            <div className="md:col-span-2 flex flex-col justify-between overflow-hidden border border-white/10 rounded-2xl bg-[#003259] transition-all duration-300 hover:border-[#1E9BFF] hover:shadow-[0_0_30px_rgba(30,155,255,0.25)] hover:-translate-y-1 group p-8 md:p-10 text-left">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Double-Locked PIN Security
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Lock sensitive directories behind a physical-like secondary authentication screen verifying frontend access tokens instantly.
                </p>
              </div>
              <div className="mt-8 w-full">
                <div className="bg-white rounded-xl p-4 border border-white/10 flex items-center justify-center aspect-[1.6] relative overflow-hidden shadow-md">
                  <Image 
                    src="/landing/pinsecurity.png" 
                    alt="PIN Panel authentication modal screenshot" 
                    fill 
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" 
                  />
                </div>
              </div>
            </div>

            {/* CARD 3: Tenant Isolation (Col-span 2 - Stacked) */}
            <div className="md:col-span-2 flex flex-col justify-between overflow-hidden border border-white/10 rounded-2xl bg-[#003259] transition-all duration-300 hover:border-[#1E9BFF] hover:shadow-[0_0_30px_rgba(30,155,255,0.25)] hover:-translate-y-1 group p-8 md:p-10 text-left">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Multi-Tenant Isolation
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Each workspace is cryptographically isolated. Your data is never mixed with others, ensuring complete privacy even at the infrastructure level.
                </p>
              </div>
              <div className="mt-8 w-full">
                <div className="bg-white rounded-xl p-4 border border-white/10 flex items-center justify-center aspect-[1.6] relative overflow-hidden shadow-md">
                  <Image 
                    src="/landing/tenant_isolation.png" 
                    alt="Multi-tenant backend data isolation screenshot" 
                    fill 
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" 
                  />
                </div>
              </div>
            </div>

            {/* CARD 4: Granular Control (Col-span 4 - Side-by-side text/image) */}
            <div className="md:col-span-4 flex flex-col justify-between overflow-hidden border border-white/10 rounded-2xl bg-[#003259] transition-all duration-300 hover:border-[#1E9BFF] hover:shadow-[0_0_30px_rgba(30,155,255,0.25)] hover:-translate-y-1 group p-8 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
                
                {/* Text Side */}
                <div className="lg:col-span-5 flex flex-col justify-center text-left">
                  <h3 className="text-xl font-bold text-white mb-3">
                    Granular Permissions
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Assign read, write, or admin permissions down to the individual document or team folder level. Instantly sync user roles.
                  </p>
                </div>

                {/* Screenshot Side */}
                <div className="lg:col-span-7 w-full">
                  <div className="bg-white rounded-xl p-4 border border-white/10 flex items-center justify-center aspect-[1.6] relative overflow-hidden shadow-md">
                    <Image 
                      src="/landing/granular.png" 
                      alt="Directory permissions control config screenshot" 
                      fill 
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" 
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* CARD 5: Smart Workspace (Col-span 3 - Stacked) */}
            <div className="md:col-span-3 flex flex-col justify-between overflow-hidden border border-white/10 rounded-2xl bg-[#003259] transition-all duration-300 hover:border-[#1E9BFF] hover:shadow-[0_0_30px_rgba(30,155,255,0.25)] hover:-translate-y-1 group p-8 md:p-10 text-left">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Workspace-Aware Architecture
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Intelligent document clustering that understands your organizational hierarchy and maintains strict permission boundaries across all silos.
                </p>
              </div>
              <div className="mt-8 w-full">
                <div className="bg-white rounded-xl p-4 border border-white/10 flex items-center justify-center aspect-[1.6] relative overflow-hidden shadow-md">
                  <Image 
                    src="/landing/workspace_aware.png" 
                    alt="Workspace awareness organization structure screenshot" 
                    fill 
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" 
                  />
                </div>
              </div>
            </div>

            {/* CARD 6: Cryptographic Encryption (Col-span 3 - Stacked) */}
            <div className="md:col-span-3 flex flex-col justify-between overflow-hidden border border-white/10 rounded-2xl bg-[#003259] transition-all duration-300 hover:border-[#1E9BFF] hover:shadow-[0_0_30px_rgba(30,155,255,0.25)] hover:-translate-y-1 group p-8 md:p-10 text-left">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Advanced Security Auditing
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Real-time monitoring and immutable logs of every document access and AI query. Know exactly who saw what and when.
                </p>
              </div>
              <div className="mt-8 w-full">
                <div className="bg-white rounded-xl p-4 border border-white/10 flex items-center justify-center aspect-[1.6] relative overflow-hidden shadow-md">
                  <Image 
                    src="/landing/secure.png" 
                    alt="Security and storage metrics screen layout screenshot" 
                    fill 
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 4. SECURITY STANDARDS */}
      <section id="security" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-xs font-bold text-[#1E9BFF] tracking-wider uppercase mb-3">
              Certifications & Compliance
            </h2>
            <p className="text-3xl font-extrabold text-[#003259] tracking-tight">
              Enterprise architecture. Compliant standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-left">
              <div className="text-4xl font-extrabold text-[#003259] mb-2">100%</div>
              <h3 className="font-bold text-sm text-[#003259] mb-2">Data Segregation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Prompt isolation guarantees user queries are structured purely within isolated tables. No models are cross-trained using multi-tenant document directories.
              </p>
            </div>
            <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-left">
              <div className="text-4xl font-extrabold text-[#003259] mb-2">&lt;100ms</div>
              <h3 className="font-bold text-sm text-[#003259] mb-2">Query Retrieval Latency</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Intelligent caching systems and highly optimized vector store indexes verify credentials locally prior to querying AI engines.
              </p>
            </div>
            <div className="p-8 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors text-left">
              <div className="text-4xl font-extrabold text-[#003259] mb-2">AES-256</div>
              <h3 className="font-bold text-sm text-[#003259] mb-2">Storage Protection</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cryptographic salts and double-factor decryption tokens secure document buffers at rest, verifying secondary PIN panels securely.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 5. CALL TO ACTION SECTION */}
      <section id="pricing" className="bg-[#003259] text-white py-20 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
              Ready to secure your company knowledge?
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Create an isolated organization workspace, drag and drop documents, and let your team query assets with confidence under complete permission guardrails.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto text-center px-8 py-4 text-sm font-bold text-[#003259] bg-[#1E9BFF] hover:bg-[#1E9BFF]/90 transition-colors rounded-xl shadow-md"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto text-center px-8 py-4 text-sm font-bold text-white bg-transparent hover:bg-white/10 border border-white/20 transition-colors rounded-xl"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>


      {/* 6. CLEAN & PROFESSIONAL FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-16 md:py-20 text-slate-500 text-sm">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 mb-16">
            
            {/* Brand Block */}
            <div className="col-span-2 text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-8 h-8 shrink-0">
                  <Image src="/logo(1).svg" alt="DocClustor Logo" fill className="object-contain" />
                </div>
                <div className="relative w-24 h-5 shrink-0">
                  <Image src="/DocClustor.svg" alt="DocClustor Logo Text" fill className="object-contain" />
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                A secure document intelligence platform that allows organization workspaces to store, search, and chat safely. Built with zero-knowledge architecture.
              </p>
            </div>

            {/* Links Block 1: Product */}
            <div className="text-left">
              <h4 className="font-bold text-[#003259] text-xs uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#capabilities" className="hover:text-[#1E9BFF] transition-colors text-xs">Capabilities</a></li>
                <li><Link href="/login" className="hover:text-[#1E9BFF] transition-colors text-xs">Platform Login</Link></li>
                <li><Link href="/signup" className="hover:text-[#1E9BFF] transition-colors text-xs">Create Workspace</Link></li>
              </ul>
            </div>

            {/* Links Block 2: Security */}
            <div className="text-left">
              <h4 className="font-bold text-[#003259] text-xs uppercase tracking-wider mb-4">Security</h4>
              <ul className="space-y-3">
                <li><a href="#security" className="hover:text-[#1E9BFF] transition-colors text-xs">Tenant Isolation</a></li>
                <li><a href="#security" className="hover:text-[#1E9BFF] transition-colors text-xs">PIN Locker Specs</a></li>
                <li><a href="#security" className="hover:text-[#1E9BFF] transition-colors text-xs">AES-256 Storage</a></li>
                <li><a href="#security" className="hover:text-[#1E9BFF] transition-colors text-xs">GDPR Compliance</a></li>
              </ul>
            </div>

            {/* Links Block 3: Company */}
            <div className="text-left">
              <h4 className="font-bold text-[#003259] text-xs uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                <li><span className="text-slate-400 text-xs cursor-default">About Us</span></li>
                <li><span className="text-slate-400 text-xs cursor-default">Careers</span></li>
                <li><span className="text-slate-400 text-xs cursor-default">Press Kit</span></li>
                <li><span className="text-slate-400 text-xs cursor-default">Contact</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-xs">
              &copy; {new Date().getFullYear()} DocClustor. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:opacity-85 hover:scale-105 transition-all w-5 h-5 relative"
                aria-label="GitHub Profile"
              >
                <Image src="/github.svg" alt="GitHub icon" fill className="object-contain" />
              </a>
              <span className="text-slate-300">|</span>
              <span className="hover:text-[#1E9BFF] transition-colors text-xs cursor-pointer">Privacy Policy</span>
              <span className="hover:text-[#1E9BFF] transition-colors text-xs cursor-pointer">Terms of Service</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
