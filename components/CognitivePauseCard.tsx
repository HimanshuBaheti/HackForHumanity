"use client";

import React, { useState } from "react";
import { ShieldCheck, Volume2, Square, ArrowRight, PauseCircle } from "lucide-react";
import { soundManager } from "@/lib/sound";

interface CognitivePauseCardProps {
  message: string;
  onHelpVerify: () => void;
  onKeepListening: () => void;
}

export function CognitivePauseCard({
  message,
  onHelpVerify,
  onKeepListening
}: CognitivePauseCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleReadAloud = () => {
    if (isSpeaking) {
      soundManager.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const fullText = `PauseCall notice: ${message}. Take your time. You don't need to make any decision right now.`;
      soundManager.speak(fullText, () => setIsSpeaking(false));
    }
  };

  return (
    <div
      className="bg-[#1b170c] border-2 border-amber-500/80 rounded-2xl p-5 text-amber-50 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden"
      role="alert"
      aria-label="Cognitive Pause Alert"
    >
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <PauseCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-wide uppercase text-amber-300">
              Cognitive Pause Recommended
            </h3>
            <span className="text-[11px] text-amber-200/70 font-medium">
              Take a breath — you are in complete control
            </span>
          </div>
        </div>

        {/* Read Aloud Button */}
        <button
          type="button"
          onClick={handleReadAloud}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors min-h-[44px] ${
            isSpeaking
              ? "bg-amber-500 text-slate-950 border-amber-400"
              : "bg-amber-950/60 text-amber-200 border-amber-500/30 hover:bg-amber-900/60"
          }`}
          aria-label={isSpeaking ? "Stop reading alert aloud" : "Read alert aloud"}
          title="Read alert aloud"
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

      {/* Body Copy */}
      <div className="bg-[#141006]/80 rounded-xl p-4 border border-amber-500/30 mb-5">
        <p className="text-base sm:text-lg font-medium text-amber-100 leading-relaxed">
          &ldquo;{message}&rdquo;
        </p>
        <p className="text-xs text-amber-300/80 mt-2 font-semibold">
          Tip: Official entities will always wait for you to verify procedural facts.
        </p>
      </div>

      {/* Action Buttons (min 56px touch target) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onHelpVerify}
          className="flex-1 min-h-[56px] px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-amber-300"
        >
          <span>Help Me Verify</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onKeepListening}
          className="min-h-[56px] px-4 py-3.5 rounded-xl bg-[#241e12] hover:bg-[#2d2516] text-amber-200 hover:text-white border border-amber-500/30 font-semibold text-sm transition-colors"
        >
          Keep Listening
        </button>
      </div>
    </div>
  );
}
