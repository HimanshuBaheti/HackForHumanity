"use client";

import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  Volume2,
  Square,
  PhoneOff,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { soundManager } from "@/lib/sound";

interface ReverseChallengeProps {
  questions: string[];
  escalationReply: string;
  escalationWarning: string;
  primaryActionText: string;
  actionDetail: string;
  scenarioId?: string;
  geminiSource?: "gemini" | "offline_rules";
  onHangUpAndVerify: () => void;
  onCallerEscalated: () => void;
  onRegenerateQuestions?: () => void;
  isRegenerating?: boolean;
}

export function ReverseChallenge({
  questions,
  escalationReply,
  escalationWarning,
  primaryActionText,
  actionDetail,
  scenarioId = "government",
  geminiSource = "offline_rules",
  onHangUpAndVerify,
  onCallerEscalated,
  onRegenerateQuestions,
  isRegenerating = false
}: ReverseChallengeProps) {
  const [hasAsked, setHasAsked] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isCallerReplying, setIsCallerReplying] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");

  const currentQuestion = questions[selectedQuestionIndex] || questions[0];

  // Read current question to the caller
  const handleReadQuestion = () => {
    if (isSpeakingQuestion) {
      soundManager.stopSpeaking();
      setIsSpeakingQuestion(false);
    } else {
      setIsSpeakingQuestion(true);
      soundManager.speak(currentQuestion, () => setIsSpeakingQuestion(false));
    }
  };

  // User submits or asks the question -> Caller speaks escalation aloud!
  const handleAskQuestion = () => {
    setHasAsked(true);
    onCallerEscalated();
    soundManager.triggerHaptic();

    // The caller audibly responds with escalating pressure!
    setIsCallerReplying(true);
    const persona = scenarioId === "grandchild" ? "grandchild" : scenarioId === "bank" ? "bank" : "government";
    soundManager.speakCaller(
      escalationReply,
      persona as "government" | "grandchild" | "bank" | "default",
      () => setIsCallerReplying(true),
      () => setIsCallerReplying(false)
    );
  };

  // Optional microphone recognition
  const handleToggleMic = () => {
    if (typeof window === "undefined") return;
    const win = window as unknown as {
      SpeechRecognition?: any;
      webkitSpeechRecognition?: any;
    };
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      alert("Microphone speech recognition is not supported in this browser. You can click 'Ask Caller This Question' directly!");
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListeningMic(true);

      recognition.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript || "";
        setSpokenTranscript(text);
        setIsListeningMic(false);
        // Automatically ask
        handleAskQuestion();
      };

      recognition.onerror = () => {
        setIsListeningMic(false);
      };

      recognition.onend = () => {
        setIsListeningMic(false);
      };

      recognition.start();
    } catch {
      setIsListeningMic(false);
    }
  };

  return (
    <div className="bg-[#121c33] border-2 border-amber-500/60 rounded-2xl p-5 text-white shadow-xl space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1e2f54] gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {hasAsked ? "Caller Response (Audio Live)" : "Reverse-Challenge Recommendations"}
            </h3>
            <span className="text-xs text-slate-300">
              {hasAsked
                ? "Caller reacted with pressure instead of answering"
                : "Ask this procedural question to verify identity"}
            </span>
          </div>
        </div>

        {/* Gemini Engine Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {geminiSource === "gemini" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3" />
              <span>Gemini Recommended</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span>On-Device Heuristics</span>
            </span>
          )}

          {onRegenerateQuestions && !hasAsked && (
            <button
              type="button"
              onClick={onRegenerateQuestions}
              disabled={isRegenerating}
              title="Get more question suggestions from Gemini"
              className="p-1.5 rounded-lg bg-[#182645] hover:bg-[#22355e] text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              aria-label="Refresh questions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-amber-400" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {!hasAsked ? (
        /* State 1: Presenting the Reverse Challenge Question */
        <div className="space-y-4">
          <div className="bg-[#0b1222] p-4 rounded-xl border border-amber-500/40 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                Recommended Question to Ask:
              </span>
              <button
                type="button"
                onClick={handleReadQuestion}
                className="flex items-center gap-1 text-xs text-amber-300 hover:text-white px-2 py-1 rounded bg-[#16233d] border border-amber-500/30"
              >
                {isSpeakingQuestion ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3 h-3" />}
                <span>{isSpeakingQuestion ? "Stop" : "Read Aloud"}</span>
              </button>
            </div>

            <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              &ldquo;{currentQuestion}&rdquo;
            </p>
          </div>

          {/* Question Selector if multiple available */}
          {questions.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-400 self-center mr-1">Other options:</span>
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedQuestionIndex(idx)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors min-h-[38px] ${
                    selectedQuestionIndex === idx
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                      : "bg-[#16233d] text-slate-400 border-slate-700 hover:text-white"
                  }`}
                >
                  Question {idx + 1}
                </button>
              ))}
            </div>
          )}

          {/* Action Row: Speak with Mic OR Ask Caller Button */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleAskQuestion}
              className="flex-1 min-h-[56px] px-5 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-amber-300"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Ask Caller This Question</span>
            </button>

            <button
              type="button"
              onClick={handleToggleMic}
              className={`min-h-[56px] px-4 py-3.5 rounded-xl border font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${
                isListeningMic
                  ? "bg-red-500/20 border-red-500 text-red-300 animate-pulse"
                  : "bg-[#162544] hover:bg-[#1d3056] border-slate-600 text-slate-200"
              }`}
              title="Speak question into your microphone"
            >
              {isListeningMic ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-amber-400" />}
              <span>{isListeningMic ? "Listening..." : "Speak into Mic"}</span>
            </button>

            <button
              type="button"
              onClick={onHangUpAndVerify}
              className="min-h-[56px] px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <PhoneOff className="w-4 h-4 text-red-400" />
              <span>Hang Up Directly</span>
            </button>
          </div>
        </div>
      ) : (
        /* State 2: Caller Escalates out loud with pressure! */
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-[#1b1414] p-4 rounded-xl border-2 border-red-500/60 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Caller Escalation (Speaking Live):</span>
              </div>
              {isCallerReplying && (
                <div className="flex items-center gap-1 text-[11px] text-red-300 font-mono bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                  <span>Audio Playing...</span>
                </div>
              )}
            </div>

            <p className="text-base sm:text-lg font-bold text-red-100 italic leading-relaxed">
              &ldquo;{escalationReply}&rdquo;
            </p>
          </div>

          {/* PauseCall Concierge Guidance */}
          <div className="bg-amber-950/40 p-4 rounded-xl border border-amber-500/40 space-y-1">
            <p className="text-sm sm:text-base font-bold text-amber-200">
              {escalationWarning}
            </p>
            <p className="text-xs text-slate-300">
              {actionDetail}
            </p>
          </div>

          {/* Primary Action Button: Red accent on final high-risk disconnect */}
          <button
            type="button"
            onClick={onHangUpAndVerify}
            className="w-full min-h-[56px] px-5 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-red-950/50 transition-all hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-red-300"
          >
            <PhoneOff className="w-6 h-6" />
            <span>{primaryActionText}</span>
          </button>
        </div>
      )}
    </div>
  );
}
