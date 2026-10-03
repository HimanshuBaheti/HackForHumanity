"use client";

import React, { useState, useEffect } from "react";
import { AccessibleHeader } from "@/components/AccessibleHeader";
import { Footer } from "@/components/Footer";
import { RiskMeter } from "@/components/RiskMeter";
import { CognitivePauseCard } from "@/components/CognitivePauseCard";
import { MicroLearningCard } from "@/components/MicroLearningCard";
import { TeachBackQuiz } from "@/components/TeachBackQuiz";
import {
  Sparkles,
  Cpu,
  AlertTriangle,
  HelpCircle,
  PhoneOff,
  CheckCircle2,
  RotateCcw,
  Volume2,
  Square,
  ArrowRight,
  ShieldCheck,
  Send
} from "lucide-react";
import type { AnalysisOutput } from "@/lib/detect";
import { soundManager } from "@/lib/sound";

const SAMPLE_TRANSCRIPTS = [
  {
    name: "Medicare Card Scam",
    text: "This is Brenda from the Medicare Eligibility Office. Your current red, white, and blue Medicare card is being deactivated this Friday due to updated chip regulations. In order to issue your new secure chip card and preserve your prescription coverage, we need you to confirm your Social Security number and pay a $150 processing fee via an electronic voucher right now over the phone."
  },
  {
    name: "Electric Utility Shut-off",
    text: "Immediate notice from County Power and Light Disconnect Department. Your meter has a delinquent balance of $485.40. A technician is currently scheduled to disconnect your residential power in exactly 30 minutes. To cancel the emergency disconnect order, you must proceed to the nearest retail kiosk, purchase a MoneyPak or Green Dot reload card, and call our dispatch line back with the pin code."
  },
  {
    name: "Publisher Clearinghouse Lottery",
    text: "Congratulations! You have been selected as the first place cash prize winner of $2,500,000 and a new luxury vehicle in the American Sweepstakes drawing. Our armored delivery van is awaiting dispatch to your neighborhood today. Under federal sweepstakes law, winners must pay the upfront 1% state tax bonding fee of $2,500 via bank wire transfer before the check can be signed over to you."
  }
];

export default function AnalyzePage() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisOutput | null>(null);
  const [speed, setSpeed] = useState<"normal" | "fast" | "instant">("normal");
  const [muted, setMuted] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pausecall_gemini_api_key");
      if (saved) setApiKey(saved);
    }
  }, []);

  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    if (typeof window !== "undefined") {
      if (newKey) localStorage.setItem("pausecall_gemini_api_key", newKey);
      else localStorage.removeItem("pausecall_gemini_api_key");
    }
  };

  const handleAnalyze = async (textToAnalyze?: string) => {
    const input = (textToAnalyze ?? transcript).trim();
    if (!input) {
      setError("Please paste or type a conversation transcript to analyze.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["x-gemini-api-key"] = apiKey;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify({ transcript: input, apiKey: apiKey || undefined })
      });

      if (!res.ok) {
        throw new Error(`Analysis server returned status ${res.status}`);
      }

      const data: AnalysisOutput = await res.json();
      setResult(data);
      soundManager.playCognitiveChime(muted);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to complete analysis. Please check your network connection or try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sampleText: string) => {
    setTranscript(sampleText);
    setError(null);
    handleAnalyze(sampleText);
  };

  const handleReadQuestion = (q: string) => {
    if (isSpeakingQuestion) {
      soundManager.stopSpeaking();
      setIsSpeakingQuestion(false);
    } else {
      setIsSpeakingQuestion(true);
      soundManager.speak(`Ask the caller: ${q}`, () => setIsSpeakingQuestion(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090e1a] text-white">
      <AccessibleHeader
        speed={speed}
        onSpeedChange={setSpeed}
        muted={muted}
        onToggleMute={() => setMuted((prev) => !prev)}
        activeTab="analyze"
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />

      <main id="main-content" className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Title & Intro */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>AI Reasoning &amp; Question Recommendation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Analyze Any Call Transcript with PauseCall AI
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Paste any suspicious phone call excerpt, voicemail transcription, or text message.
            PauseCall evaluates manipulation heuristics, extracts danger signals, and recommends tailored <strong>Reverse-Challenge Questions</strong> powered by Gemini AI with on-device fallback.
          </p>
        </div>

        {/* Input Box Card */}
        <section aria-labelledby="input-heading" className="bg-[#101729] rounded-2xl border border-[#1e2e50] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 id="input-heading" className="text-base font-bold text-white">
              Paste Call or SMS Transcript
            </h2>
            {/* Quick 1-Click Samples */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Quick Test:</span>
              {SAMPLE_TRANSCRIPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample.text)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[#16233d] hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-[#253961] font-semibold transition-colors min-h-[36px]"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="transcript-input" className="sr-only">
              Call Transcript Text
            </label>
            <textarea
              id="transcript-input"
              rows={5}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="e.g., 'Hello, this is Agent Williams from the IRS. Your Social Security number has been linked to criminal activity and you must wire $2,000 to avoid arrest today...'"
              className="w-full rounded-xl bg-[#090f1d] border-2 border-[#203358] focus:border-amber-400 focus:outline-none p-4 text-white text-base leading-relaxed placeholder:text-slate-500 resize-y"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-400">
              {transcript.length} characters entered &bull; Ephemeral processing
            </span>

            <button
              type="button"
              onClick={() => handleAnalyze()}
              disabled={loading}
              className="min-h-[56px] px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Conversational Intent...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Conversation</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Canvas */}
        {result && (
          <section aria-labelledby="results-heading" className="space-y-6 animate-in fade-in duration-300">
            {/* Status & Engine Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11192e] p-4 rounded-xl border border-[#21355c]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 id="results-heading" className="text-base font-bold text-white">
                  Analysis Complete
                </h2>
              </div>

              {/* Offline Rules vs Gemini Badge requirement */}
              {result.source === "gemini" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Powered by Gemini AI (Real-time Reasoning)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                  <Cpu className="w-3.5 h-3.5 text-amber-300" />
                  <span>Using Offline Rules (Deterministic Privacy Shield)</span>
                </div>
              )}
            </div>

            {/* Risk Assessment Meter */}
            <RiskMeter risk={result.risk} riskScore={result.riskScore} />

            {/* Cognitive Pause Hero Message */}
            <div className="bg-[#1a160c] border-2 border-amber-500/80 rounded-2xl p-5 text-amber-50 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold text-xs">
                    CP
                  </div>
                  <h3 className="text-base font-black text-amber-300 uppercase tracking-wide">
                    PauseCall Cognitive Pause
                  </h3>
                </div>
                <span className="text-xs text-amber-200/80 font-medium">
                  System 1 ➔ System 2 Shift
                </span>
              </div>
              <p className="text-lg font-medium text-amber-100 leading-relaxed bg-[#110e07] p-4 rounded-xl border border-amber-500/30">
                &ldquo;{result.pause_message}&rdquo;
              </p>
            </div>

            {/* Recommended Reverse-Challenge Questions (The User's Core Request) */}
            <div className="bg-[#121c33] border border-[#20345b] rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1d2f54]">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  Recommended Reverse-Challenge Questions
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300">
                Instruct the older adult to read these questions directly to the caller. These procedural checks exploit the scammer&apos;s lack of verified biographical context:
              </p>

              <div className="space-y-3">
                {result.verification_questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-[#0b1222] p-4 rounded-xl border border-[#233863] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-base font-bold text-white leading-relaxed">
                        &ldquo;{q}&rdquo;
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReadQuestion(q)}
                      className="self-end sm:self-auto text-xs px-3 py-2 rounded-lg bg-[#182747] hover:bg-[#203561] text-amber-200 border border-amber-500/30 flex items-center gap-1.5 transition-colors shrink-0 min-h-[40px]"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Read Aloud</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Anticipated Escalation Warning */}
              <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/30 text-xs sm:text-sm text-amber-100 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 uppercase tracking-wider text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Anticipated Caller Escalation:</span>
                </div>
                <p>{result.escalation_warning}</p>
              </div>
            </div>

            {/* Detected Warning Signals */}
            <div className="bg-[#10172a] border border-[#1e2d4e] rounded-2xl p-5 space-y-3">
              <h3 className="text-base font-bold text-white">
                Detected Manipulation Signals ({result.signals.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.signals.map((sig, idx) => (
                  <div key={idx} className="bg-[#142038] p-3.5 rounded-xl border border-[#23365c] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 text-sm">{sig.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {sig.type}
                      </span>
                    </div>
                    {sig.evidence && (
                      <p className="italic text-slate-300 bg-[#0c1220] p-2 rounded border border-slate-800 font-mono">
                        &ldquo;{sig.evidence}&rdquo;
                      </p>
                    )}
                    <p className="text-slate-200">{sig.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Out-of-Band (OOB) Action */}
            <div className="bg-[#121c33] border border-emerald-500/50 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                <ShieldCheck className="w-5 h-5" />
                <span>Recommended Out-of-Band (OOB) Action</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {result.out_of_band_action}
              </p>
            </div>

            {/* Teach-Back Reinforcement */}
            {result.teach_back && (
              <TeachBackQuiz
                question={result.teach_back.question}
                options={result.teach_back.options}
                onComplete={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                muted={muted}
              />
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
