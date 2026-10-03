"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, HeartHandshake, FileText, Info } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#1a2742] bg-[#080d19] py-8 px-4 sm:px-6 mt-auto text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-1">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>PauseCall</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Hackathon Prototype
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Accessible AI Safeguards for Older Adults: Real-Time Scam Interception, Cognitive-Pause Verification, and Embedded Digital Literacy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <Link href="/" className="hover:text-amber-400 transition-colors py-2">
              Simulator
            </Link>
            <Link href="/analyze" className="hover:text-amber-400 transition-colors py-2">
              Try Your Own (AI Mode)
            </Link>
          </div>
        </div>

        {/* Mandatory Requirement Checklist Notice */}
        <div className="bg-[#0e1628] rounded-xl p-4 border border-[#1d2d4d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-200">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-100">
              Simulation for demonstration; no real calls are recorded or analyzed.
            </span>
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            WCAG AAA Accessible &bull; Ephemeral Memory &bull; Zero Audio Storage
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80 gap-2">
          <p>&copy; {new Date().getFullYear()} PauseCall Project. Built for HackForHumanity.</p>
          <p className="text-slate-300">
            Grounded in dual-process cognitive ergonomics &amp; respectful assistive technology.
          </p>
        </div>
      </div>
    </footer>
  );
}
