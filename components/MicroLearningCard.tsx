"use client";

import React, { useState } from "react";
import { CheckCircle2, Volume2, Square, ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { soundManager } from "@/lib/sound";

interface MicroLearningCardProps {
  title: string;
  summary: string;
  tactics: Array<{
    name: string;
    badge?: string;
    description?: string;
    explanation?: string;
  }>;
  coreRule: string;
  onContinue: () => void;
}

export function MicroLearningCard({
  title,
  summary,
  tactics,
  coreRule,
  onContinue
}: MicroLearningCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleReadAloud = () => {
    if (isSpeaking) {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToSpeak = `You handled a suspicious call. Summary: ${summary}. Remember this golden rule: ${coreRule}`;
      soundManager.speak(textToSpeak, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="bg-[#10182b] border border-[#223559] rounded-2xl p-5 text-white shadow-2xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2b4a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              You Handled a Suspicious Call Safely
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">
              60-Second Just-In-Time Microlearning
            </span>
          </div>
        </div>

        {/* Read Aloud button */}
        <button
          type="button"
          onClick={handleReadAloud}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors min-h-[44px] ${
            isSpeaking
              ? "bg-amber-500 text-slate-950 border-amber-400"
              : "bg-[#182644] text-amber-200 border-amber-500/30 hover:bg-[#203259]"
          }`}
          aria-label={isSpeaking ? "Stop speech" : "Read lesson aloud"}
          title="Read lesson aloud"
        >
          {isSpeaking ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Narrative */}
      <div className="bg-[#142038] p-4 rounded-xl border border-[#263c69]">
        <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wide mb-1">
          {title}
        </h4>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Tactics Breakdown */}
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2.5">
          Tactics Attempted by Caller:
        </h4>
        <div className="space-y-2.5">
          {tactics.map((tactic, idx) => (
            <div
              key={idx}
              className="bg-[#0b1222] p-3 rounded-xl border border-slate-800 flex items-start gap-3"
            >
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
                {tactic.badge || tactic.name}
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {tactic.description || tactic.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Rule of Thumb */}
      <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/40">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Core Rule to Remember:</span>
        </div>
        <p className="text-base sm:text-lg font-bold text-amber-100 leading-snug">
          &ldquo;{coreRule}&rdquo;
        </p>
      </div>

      {/* Continue Action */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full min-h-[56px] px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-amber-300"
      >
        <span>Continue to 30-Second Check-in</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
