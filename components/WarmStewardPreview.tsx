"use client";

import React, { useState } from "react";
import {
  Heart,
  ShieldCheck,
  BellRing,
  RotateCcw,
  Sparkles,
  Lock,
  EyeOff,
  UserCheck
} from "lucide-react";
import Link from "next/link";

interface WarmStewardProps {
  recipient: string;
  headline: string;
  body: string;
  privacyNote: string;
  recommendedAction: string;
  onRestartScenario: () => void;
  onChooseOtherScenario: () => void;
}

export function WarmStewardPreview({
  recipient,
  headline,
  body,
  privacyNote,
  recommendedAction,
  onRestartScenario,
  onChooseOtherScenario
}: WarmStewardProps) {
  const [showPrivacyAudit, setShowPrivacyAudit] = useState(false);

  return (
    <div className="bg-[#10172b] border border-[#22355c] rounded-2xl p-5 text-white shadow-2xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[#1b2b4a]">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
          <Heart className="w-6 h-6 fill-pink-500/30" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">
            Intergenerational &ldquo;Warm Steward&rdquo; Model
          </h3>
          <span className="text-xs text-pink-300 font-semibold">
            Supportive Family Awareness Without Intrusive Surveillance
          </span>
        </div>
      </div>

      {/* Simulated Caregiver Phone Notification Bubble */}
      <div>
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
          Mock Caregiver Handset Notification:
        </span>
        <div className="bg-[#0b1222] border-2 border-[#2b3e6b] rounded-2xl p-4 shadow-inner space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-[10px]">
                PC
              </div>
              <span className="font-semibold text-slate-200">PauseCall Family Shield</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Just now</span>
          </div>

          <div className="pl-7">
            <h4 className="text-sm font-bold text-amber-300">
              {headline}
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
              {body}
            </p>
            <div className="mt-2 text-xs font-semibold text-pink-300 bg-pink-950/40 border border-pink-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 shrink-0" />
              <span>Prompt: {recommendedAction}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy-Preserving Guarantee */}
      <div className="bg-[#131d33] p-4 rounded-xl border border-[#23355b] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
              Privacy Architecture Guarantee
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPrivacyAudit((prev) => !prev)}
            className="text-xs text-amber-300 hover:text-white underline min-h-[36px]"
          >
            {showPrivacyAudit ? "Hide Details" : "Inspect Privacy Shield"}
          </button>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {privacyNote}
        </p>

        {showPrivacyAudit && (
          <div className="bg-[#0b101c] p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1.5 mt-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero call audio saved or transmitted</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <EyeOff className="w-4 h-4" />
              <span>No conversational transcripts sent to family</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300 font-semibold">
              <UserCheck className="w-4 h-4" />
              <span>Transforms surveillance into loving, respectful check-ins</span>
            </div>
          </div>
        )}
      </div>

      {/* Completion Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onChooseOtherScenario}
          className="flex-1 min-h-[56px] px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-amber-300"
        >
          <Sparkles className="w-5 h-5" />
          <span>Try Another Scenario</span>
        </button>

        <Link
          href="/analyze"
          className="flex-1 min-h-[56px] px-5 py-3.5 rounded-xl bg-[#1e2c4d] hover:bg-[#273a66] border border-slate-600 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors focus-visible:ring-4 focus-visible:ring-amber-300"
        >
          <span>Test Custom AI Mode</span>
        </Link>
      </div>
    </div>
  );
}
