"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, CheckCircle, ShieldAlert, Scale, Ban, Award } from "lucide-react";

export default function TermsOfService() {
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
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#003259] tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Welcome to DocClustor. These terms govern your subscription, workspace access, and usage guidelines for our platforms.
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
                <CheckCircle className="w-5 h-5" />
              </div>
              <h2>1. Agreement to Terms</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 pl-11">
              <p>
                By creating an account, launching a document locker, or deploying semantic search workflows within DocClustor, you agree to comply with and be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or legal entity, you warrant that you possess full administrative authority to bind that entity.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#003259]">
              <div className="p-1.5 bg-blue-50 text-[#1E9BFF] rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <h2>2. Workspace Usage and Accounts</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 pl-11">
              <p>
                To utilize DocClustor's secure indexing pipelines, users must maintain valid, verified accounts:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You are responsible for safeguarding your master security locker PINs.</li>
                <li>You must immediately notify our response team at <a href="mailto:security@docclustor.me" className="text-[#1E9BFF] hover:underline font-semibold">security@docclustor.me</a> if any workspace account keys are lost, exposed, or compromised.</li>
                <li>Sharing master credentials, locker pins, or API tokens outside of the designated tenant organization parameters is strictly prohibited.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#003259]">
              <div className="p-1.5 bg-blue-50 text-[#1E9BFF] rounded-lg">
                <Ban className="w-5 h-5" />
              </div>
              <h2>3. Acceptable Use Guidelines</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 pl-11">
              <p>
                You agree not to utilize DocClustor's cluster processing servers to analyze, index, or distribute:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Files containing malicious programs, active exploits, ransomware payloads, or spyware trackers.</li>
                <li>Intellectual property belonging to third parties without explicit legal permission.</li>
                <li>Data intended to violate local, state, federal, or international corporate data compliance standards.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#003259]">
              <div className="p-1.5 bg-blue-50 text-[#1E9BFF] rounded-lg">
                <Award className="w-5 h-5" />
              </div>
              <h2>4. Intellectual Property</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3 pl-11">
              <p>
                All rights, titles, and interests in the DocClustor logo systems, landing layouts, proprietary clustering code, vector mapping algorithms, and security enclaves are the sole property of DocClustor. Your uploaded documents and search index outputs remain completely yours, under absolute client data sovereignty.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-lg font-bold text-[#003259]">
              <div className="p-1.5 bg-blue-50 text-[#1E9BFF] rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2>5. Limitation of Liability</h2>
            </div>
            <div className="text-slate-600 text-sm leading-relaxed pl-11 space-y-2">
              <p>
                DocClustor services are provided on an "as-is" and "as available" basis. To the maximum extent permitted by applicable law, DocClustor shall not be held liable for any indirect, incidental, punitive, or consequential damages resulting from data loss, vector corruption, locker pin loss, or system downtime.
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
            <Link href="/privacy" className="hover:text-[#1E9BFF] transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-[#1E9BFF] transition-colors">Home</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
