"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Lock, Eye, FileText, Server, AlertCircle } from "lucide-react";

export default function PrivacyPolicy() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-poppins selection:bg-[#1E9BFF]/20 selection:text-[#003259]">
      
      {/* HEADER NAVBAR */}
      <div className="fixed top-0 inset-x-0 z-50 pointer-events-none flex justify-center p-0 md:p-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <header 
          className={`
            w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto
            ${isScrolled 
              ? "max-w-4xl bg-white/80 border border-slate-200/80 shadow-[0_16px_32px_-10px_rgba(0,50,89,0.1)] rounded-full backdrop-blur-md px-6 py-2.5 mt-2" 
              : "max-w-7xl bg-white/40 border-b border-transparent backdrop-blur-none px-6 md:px-8 py-5"
            }
          `}
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <div className={`relative shrink-0 transition-all duration-500 ${isScrolled ? "w-7 h-7" : "w-8 h-8"}`}>
                <Image 
                  src="/logo(1).svg" 
                  alt="DocClustor Logo" 
                  fill 
                  className="object-contain" 
                  priority 
                />
              </div>
              <div className={`relative shrink-0 transition-all duration-500 ${isScrolled ? "w-24 h-5" : "w-28 h-6"}`}>
                <Image 
                  src="/DocClustor.svg" 
                  alt="DocClustor Logo Text" 
                  fill 
                  className="object-contain" 
                  priority 
                />
              </div>
            </Link>

            <Link href="/" className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#003259] bg-white border border-slate-200/80 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </header>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden bg-gradient-to-b from-[#003259]/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white border border-blue-100 rounded-2xl shadow-sm text-[#1E9BFF] mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#003259] tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Your trust is our most valuable asset. Learn how DocClustor protects, encrypts, and handles your organization's document metadata.
          </p>
          <div className="mt-6 inline-block bg-slate-100/80 border border-slate-200 text-slate-500 text-xs font-medium px-4 py-1.5 rounded-full">
            Last Updated: June 2026
          </div>
        </div>
      </section>

      {/* CONTENT BODY */}
      <main className="max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-12 shadow-sm space-y-12">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#003259]">
              <div className="p-1.5 bg-blue-50 text-[#1E9BFF] rounded-lg">
                <Lock className="w-5 h-5" />
              </div>
              <h2>1. Our Zero-Knowledge Guarantee</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 pl-11">
              <p>
                At DocClustor, security is not an afterthought; it is built into our core architecture. We operate on a strict <strong>Zero-Knowledge</strong> model:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Your raw documents are encrypted at the edge before leaving your secure client environment.</li>
                <li>Decryption keys reside solely in your local security enclaves or within your Per-User Locker vaults.</li>
                <li>DocClustor administrators and cloud processors have no mathematical path to view your unencrypted document content.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#003259]">
              <div className="p-1.5 bg-blue-50 text-[#1E9BFF] rounded-lg">
                <Eye className="w-5 h-5" />
              </div>
              <h2>2. Information We Collect</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 pl-11">
              <p>
                To provide semantic search, bento-grid insights, and intelligent document organization, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account Credentials:</strong> Basic identification details (name, business email, organization name) provided during user registration and authentication setup.</li>
                <li><strong>Encrypted Vector Embeddings:</strong> High-dimensional mathematical representations of your documents used to power search, without containing raw readable text.</li>
                <li><strong>System Activity Logs:</strong> System metrics, performance stats, and access records for audit logs to assist workspace compliance.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#003259]">
              <div className="p-1.5 bg-blue-50 text-[#1E9BFF] rounded-lg">
                <Server className="w-5 h-5" />
              </div>
              <h2>3. Data Sovereignty & Hosting</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 pl-11">
              <p>
                All data, indexes, and user metadata are stored in highly secure cloud facilities compliant with SOC2 Type II, ISO 27001, and HIPAA benchmarks. You have full jurisdiction to control:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Regional deployment boundaries (e.g. US-only, EU-only data retention options).</li>
                <li>Instant workspace wipe commands which purge databases and locker enclaves with cryptographically verifiable deletion logs.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#003259]">
              <div className="p-1.5 bg-blue-50 text-[#1E9BFF] rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <h2>4. Third-Party Integrations</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 pl-11">
              <p>
                DocClustor interfaces with select external services (such as OAuth providers like GitHub and Google) to verify login states. We never share, trade, or distribute your private search indices, document clusters, or tenant credentials with advertising networks or third-party AI model aggregators.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#003259]">
              <div className="p-1.5 bg-blue-50 text-[#1E9BFF] rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2>5. Contact Us</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed pl-11">
              <p>
                If you have questions regarding this Privacy Policy, your security lockers, or GDPR/compliance audits, please reach out to our security officer team at <a href="mailto:security@docclustor.me" className="text-[#1E9BFF] hover:underline font-semibold">security@docclustor.me</a>.
              </p>
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-slate-400 text-xs">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} DocClustor. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-[#1E9BFF] transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-[#1E9BFF] transition-colors">Home</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
