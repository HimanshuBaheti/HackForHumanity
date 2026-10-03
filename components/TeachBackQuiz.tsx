"use client";

import React, { useState } from "react";
import { HelpCircle, CheckCircle2, RotateCcw, ArrowRight, Sparkles } from "lucide-react";
import { soundManager } from "@/lib/sound";

interface Option {
  id?: string;
  text: string;
  isCorrect?: boolean;
  is_correct?: boolean;
  feedback: string;
}

interface TeachBackQuizProps {
  question: string;
  options: Option[];
  onComplete: () => void;
  muted?: boolean;
}

export function TeachBackQuiz({
  question,
  options,
  onComplete,
  muted = false
}: TeachBackQuizProps) {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSelect = (opt: Option) => {
    setSelectedOption(opt);
    setHasSubmitted(true);

    const isCorrect = opt.isCorrect ?? opt.is_correct ?? false;
    if (isCorrect) {
      soundManager.playSuccessChime(muted);
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
  };

  const isCurrentSelectionCorrect = selectedOption
    ? (selectedOption.isCorrect ?? selectedOption.is_correct ?? false)
    : false;

  return (
    <div className="bg-[#11192e] border border-[#22365c] rounded-2xl p-5 text-white shadow-2xl space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[#1b2b4a]">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">
            Teach-Back Check-in
          </h3>
          <span className="text-xs text-amber-300 font-semibold">
            Strengthening your personal fraud immunity
          </span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="bg-[#14223d] p-4 rounded-xl border border-[#253d6e]">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-400 block mb-1">
          Scenario Question:
        </span>
        <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {question}
        </p>
      </div>

      {/* Options List */}
      {!hasSubmitted ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-300 font-medium">
            Select the best course of action:
          </p>
          {options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full min-h-[56px] p-4 rounded-xl bg-[#0b1324] hover:bg-[#182747] active:bg-[#1f335c] border border-slate-700 hover:border-amber-400/70 text-left flex items-start gap-3 transition-all group focus-visible:ring-4 focus-visible:ring-amber-300"
              >
                <span className="w-8 h-8 rounded-lg bg-[#182645] border border-slate-600 flex items-center justify-center text-amber-300 font-bold text-sm shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  {letter}
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-white leading-relaxed">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Feedback Card */
        <div className="space-y-4 animate-in fade-in duration-300">
          <div
            className={`p-4 rounded-xl border ${
              isCurrentSelectionCorrect
                ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-100"
                : "bg-[#1f1710] border-amber-500/50 text-amber-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCurrentSelectionCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="font-black text-emerald-300 uppercase tracking-wide text-sm">
                    Spot On! Excellent Decision.
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="font-bold text-amber-300 uppercase tracking-wide text-sm">
                    Good Thought, Here&apos;s Why Scammers Use That
                  </span>
                </>
              )}
            </div>

            <p className="text-sm sm:text-base leading-relaxed">
              {selectedOption?.feedback}
            </p>
          </div>

          {/* Action based on result */}
          {isCurrentSelectionCorrect ? (
            <button
              type="button"
              onClick={onComplete}
              className="w-full min-h-[56px] px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              <span>View Family Caregiver Preview</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetry}
              className="w-full min-h-[56px] px-6 py-3.5 rounded-xl bg-[#1d273d] hover:bg-[#25324e] border border-slate-600 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>Try Another Choice</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
