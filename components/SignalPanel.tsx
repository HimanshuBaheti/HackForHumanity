"use client";

import React from "react";
import {
  BadgeAlert,
  Clock,
  Skull,
  CircleDollarSign,
  EyeOff,
  KeyRound,
  ShieldCheck,
  Info
} from "lucide-react";
import type { DetectedSignal } from "@/lib/detect";

interface SignalPanelProps {
  signals: DetectedSignal[];
}

export function SignalPanel({ signals }: SignalPanelProps) {
  const getIcon = (type: DetectedSignal["type"]) => {
    switch (type) {
      case "authority":
        return <BadgeAlert className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />;
      case "threat":
        return <Skull className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />;
      case "urgency":
        return <Clock className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />;
      case "financial":
        return <CircleDollarSign className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />;
      case "secrecy":
        return <EyeOff className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />;
      case "credentials":
        return <KeyRound className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />;
      default:
        return <Info className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />;
    }
  };

  return (
    <div
      className="bg-[#101728] rounded-2xl border border-[#1e2d4d] p-5 flex flex-col h-full shadow-lg"
      aria-live="polite"
      aria-label="What PauseCall notices side panel"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#1c2944] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            What PauseCall Notices
          </h2>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {signals.length} {signals.length === 1 ? "Signal" : "Signals"} Active
        </span>
      </div>

      {signals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
          <div className="w-12 h-12 rounded-full bg-[#162138] flex items-center justify-center mb-3">
            <Info className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-300">Awaiting Conversation Signals</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
            As the conversation progresses, linguistic manipulation markers will appear here in plain language.
          </p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1">
          {signals.map((signal, idx) => (
            <div
              key={`${signal.type}-${idx}`}
              className="bg-[#141f36] rounded-xl p-3.5 border border-[#23355b] hover:border-amber-500/40 transition-all text-left animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {getIcon(signal.type)}
                <span className="text-sm font-bold text-amber-300 tracking-wide">
                  {signal.label}
                </span>
              </div>

              {signal.evidence && (
                <div className="bg-[#0b101d] rounded-lg px-2.5 py-1.5 my-1.5 border border-slate-800 text-xs text-slate-300 font-mono italic">
                  &ldquo;{signal.evidence}&rdquo;
                </div>
              )}

              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                <strong className="text-amber-200/90 font-semibold">Why this matters: </strong>
                {signal.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
