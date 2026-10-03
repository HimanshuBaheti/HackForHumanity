"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  Building,
  UserCheck,
  CreditCard,
  Laptop,
  Volume2,
  VolumeX,
  Radio,
  Play
} from "lucide-react";
import { SCENARIOS, type Scenario, type ScenarioTranscriptLine } from "@/data/scenarios";
import { PhoneFrame } from "@/components/PhoneFrame";
import { RiskMeter } from "@/components/RiskMeter";
import { SignalPanel } from "@/components/SignalPanel";
import { TranscriptFeed } from "@/components/TranscriptFeed";
import { CognitivePauseCard } from "@/components/CognitivePauseCard";
import { ReverseChallenge } from "@/components/ReverseChallenge";
import { MicroLearningCard } from "@/components/MicroLearningCard";
import { TeachBackQuiz } from "@/components/TeachBackQuiz";
import { WarmStewardPreview } from "@/components/WarmStewardPreview";
import { soundManager } from "@/lib/sound";
import type { DetectedSignal } from "@/lib/detect";

export type FlowStep =
  | "landing"
  | "incoming"
  | "in_call"
  | "cognitive_pause"
  | "reverse_challenge"
  | "micro_learning"
  | "teach_back"
  | "warm_steward";

interface CallSimulatorProps {
  speed: "normal" | "fast" | "instant";
  muted: boolean;
  apiKey?: string;
}

export function CallSimulator({ speed, muted, apiKey = "" }: CallSimulatorProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("government");
  const [step, setStep] = useState<FlowStep>("landing");
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [displayedLines, setDisplayedLines] = useState<ScenarioTranscriptLine[]>([]);
  const [accumulatedSignals, setAccumulatedSignals] = useState<DetectedSignal[]>([]);
  const [currentRisk, setCurrentRisk] = useState<"LOW" | "MEDIUM" | "HIGH">("LOW");
  const [callTimerSeconds, setCallTimerSeconds] = useState<number>(0);
  const [isCallerSpeaking, setIsCallerSpeaking] = useState<boolean>(false);
  const [callerAudioEnabled, setCallerAudioEnabled] = useState<boolean>(true);

  // Gemini recommended questions state
  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>([]);
  const [geminiSource, setGeminiSource] = useState<"gemini" | "offline_rules">("offline_rules");
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transcriptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  // Helper to get delay based on pacing setting
  const getLineDelay = useCallback(() => {
    switch (speed) {
      case "instant":
        return 200;
      case "fast":
        return 1400;
      case "normal":
      default:
        return 3000;
    }
  }, [speed]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (transcriptTimeoutRef.current) clearTimeout(transcriptTimeoutRef.current);
      soundManager.stopPhoneRingtone();
      soundManager.stopSpeaking();
    };
  }, []);

  // Handle incoming call step ringtone
  useEffect(() => {
    if (step === "incoming") {
      soundManager.startPhoneRingtone(muted);
    } else {
      soundManager.stopPhoneRingtone();
    }
  }, [step, muted]);

  // Call duration counter during active call states
  useEffect(() => {
    if (step === "in_call" || step === "cognitive_pause" || step === "reverse_challenge") {
      timerRef.current = setInterval(() => {
        setCallTimerSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  // Fetch Gemini recommendations based on caller information and transcript
  const fetchGeminiRecommendations = useCallback(
    async (linesToAnalyze: ScenarioTranscriptLine[]) => {
      setIsLoadingRecommendations(true);
      try {
        const fullText = linesToAnalyze.map((l) => `${l.speaker}: ${l.text}`).join("\n");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (apiKey) {
          headers["x-gemini-api-key"] = apiKey;
        }

        const res = await fetch("/api/recommend-questions", {
          method: "POST",
          headers,
          body: JSON.stringify({
            transcript: fullText,
            callerName: scenario.callerName,
            callerNumber: scenario.callerNumber,
            scenarioCategory: scenario.category,
            scenarioId: scenario.id,
            apiKey: apiKey || undefined
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            setRecommendedQuestions(data.questions);
            setGeminiSource(data.source || "offline_rules");
          }
        }
      } catch (e) {
        console.warn("Failed to fetch questions from Gemini:", e);
      } finally {
        setIsLoadingRecommendations(false);
      }
    },
    [scenario, apiKey]
  );

  // Progressive Transcript Typewriter Machine with LIVE Caller Speech
  useEffect(() => {
    if (step !== "in_call") return;

    if (currentLineIndex < scenario.transcriptLines.length) {
      const nextLine = scenario.transcriptLines[currentLineIndex];
      const delay = currentLineIndex === 0 ? 300 : getLineDelay();

      transcriptTimeoutRef.current = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev, nextLine];

          // Speak caller line aloud through speakers if audio enabled!
          if (callerAudioEnabled && !muted) {
            const persona =
              scenario.id === "grandchild"
                ? "grandchild"
                : scenario.id === "bank"
                ? "bank"
                : "government";
            soundManager.speakCaller(
              nextLine.text,
              persona as "government" | "grandchild" | "bank" | "default",
              () => setIsCallerSpeaking(true),
              () => setIsCallerSpeaking(false)
            );
          }

          return updated;
        });

        // Accumulate signals and update risk if triggered by this line
        if (nextLine.triggerSignal) {
          setAccumulatedSignals((prev) => {
            const alreadyExists = prev.some((s) => s.type === nextLine.triggerSignal!.type);
            if (!alreadyExists) {
              return [...prev, nextLine.triggerSignal!];
            }
            return prev;
          });
        }

        if (nextLine.triggerRisk) {
          setCurrentRisk(nextLine.triggerRisk);
        }

        // Check if we hit the Cognitive Pause Hero Moment trigger
        if (currentLineIndex + 1 === scenario.cognitivePauseTriggerIndex) {
          setTimeout(() => {
            soundManager.stopSpeaking();
            setIsCallerSpeaking(false);
            setStep("cognitive_pause");
            soundManager.playCognitiveChime(muted);

            // Fetch Gemini AI recommendations for questions!
            fetchGeminiRecommendations(scenario.transcriptLines.slice(0, currentLineIndex + 1));
          }, speed === "instant" ? 150 : 1500);
        } else {
          setCurrentLineIndex((prev) => prev + 1);
        }
      }, delay);
    }

    return () => {
      if (transcriptTimeoutRef.current) clearTimeout(transcriptTimeoutRef.current);
    };
  }, [
    step,
    currentLineIndex,
    scenario,
    getLineDelay,
    speed,
    muted,
    callerAudioEnabled,
    fetchGeminiRecommendations
  ]);

  // Action: Launch Incoming Call Simulation
  const handleStartSimulation = (scenarioId?: string) => {
    soundManager.unlockAudio();
    if (scenarioId) setSelectedScenarioId(scenarioId);
    setDisplayedLines([]);
    setAccumulatedSignals([]);
    setCurrentRisk("LOW");
    setCurrentLineIndex(0);
    setCallTimerSeconds(0);
    setIsCallerSpeaking(false);
    setRecommendedQuestions(scenario.verificationQuestions);
    setGeminiSource("offline_rules");
    setStep("incoming");
  };

  // Action: Accept Call (Explicit user gesture unlocks browser speech synthesis!)
  const handleAcceptCall = () => {
    soundManager.unlockAudio();
    soundManager.stopPhoneRingtone();
    setStep("in_call");

    // Speak initial greeting directly on click gesture so browser immediately starts audio
    if (callerAudioEnabled && !muted && scenario.transcriptLines[0]) {
      const firstLine = scenario.transcriptLines[0].text;
      const persona =
        scenario.id === "grandchild"
          ? "grandchild"
          : scenario.id === "bank"
          ? "bank"
          : "government";
      soundManager.speakCaller(
        firstLine,
        persona as "government" | "grandchild" | "bank" | "default",
        () => setIsCallerSpeaking(true),
        () => setIsCallerSpeaking(false)
      );
    }
  };

  // Action: Decline Call
  const handleDeclineCall = () => {
    soundManager.stopPhoneRingtone();
    setStep("landing");
  };

  // Action: Cognitive Pause -> Help Me Verify
  const handleHelpVerify = () => {
    soundManager.unlockAudio();
    setStep("reverse_challenge");
  };

  // Action: Cognitive Pause -> Keep Listening
  const handleKeepListening = () => {
    soundManager.unlockAudio();
    setStep("in_call");
    setCurrentLineIndex((prev) => prev + 1);
  };

  // Action: Caller Escalated during Reverse Challenge
  const handleCallerEscalated = () => {
    setCurrentRisk("HIGH");
  };

  // Action: Hang Up & Verify Official Number
  const handleHangUpAndVerify = () => {
    soundManager.stopSpeaking();
    setIsCallerSpeaking(false);
    setStep("micro_learning");
  };

  // Action: Complete Microlearning
  const handleMicrolearningComplete = () => {
    soundManager.unlockAudio();
    setStep("teach_back");
  };

  // Action: Complete Teach-Back Quiz
  const handleTeachBackComplete = () => {
    soundManager.unlockAudio();
    setStep("warm_steward");
  };

  // Action: Return to Landing / Pick New Scenario
  const handleReturnToLanding = () => {
    soundManager.stopSpeaking();
    setIsCallerSpeaking(false);
    setStep("landing");
  };

  // Manual replay of caller audio
  const handlePlayCallerAudio = () => {
    soundManager.unlockAudio();
    const lastLine = displayedLines[displayedLines.length - 1] || scenario.transcriptLines[0];
    const persona =
      scenario.id === "grandchild"
        ? "grandchild"
        : scenario.id === "bank"
        ? "bank"
        : "government";
    soundManager.speakCaller(
      lastLine.text,
      persona as "government" | "grandchild" | "bank" | "default",
      () => setIsCallerSpeaking(true),
      () => setIsCallerSpeaking(false)
    );
  };

  const getScenarioIcon = (cat: Scenario["category"]) => {
    switch (cat) {
      case "Government":
        return <Building className="w-6 h-6 text-blue-400" />;
      case "Family Emergency":
        return <UserCheck className="w-6 h-6 text-amber-400" />;
      case "Financial / Bank":
        return <CreditCard className="w-6 h-6 text-emerald-400" />;
      case "Tech Support":
        return <Laptop className="w-6 h-6 text-purple-400" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* LANDING SCREEN */}
      {step === "landing" && (
        <section aria-labelledby="landing-heading" className="space-y-10 animate-in fade-in duration-300">
          {/* Hero Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Theme: Make AI easier to understand, evaluate, and use with confidence</span>
            </div>
            <h1
              id="landing-heading"
              className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight"
            >
              Don&apos;t just detect the scam.{" "}
              <span className="text-amber-400 underline decoration-amber-500/50 decoration-wavy underline-offset-8">
                Help them see it.
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              When elder fraud strikes, abrupt &ldquo;HANG UP&rdquo; alerts cause confusion and denial.
              PauseCall provides a live <strong>audible conversation</strong> where you hear the caller,
              receives a calm <strong>Cognitive Pause</strong>, gets real-time <strong>Gemini AI question recommendations</strong>,
              and empowers older adults with structured reverse-challenge questions.
            </p>
          </div>

          {/* Core 3-Step Ergonomic Loop */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-[#121c33] p-5 rounded-2xl border border-[#203359] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  1. Listen &amp; Detect
                </span>
                <Radio className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Live Caller Voice</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Hear the caller speak aloud in real-time while PauseCall extracts manipulative cues in ephemeral memory.
              </p>
            </div>

            <div className="bg-[#1b170c] p-5 rounded-2xl border border-amber-500/40 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  2. Cognitive Pause
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-amber-200">Gemini Recommendations</h2>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                A soothing chime interrupts caller pacing; Gemini AI recommends targeted reverse-challenge questions tailored to the caller.
              </p>
            </div>

            <div className="bg-[#101b2a] p-5 rounded-2xl border border-[#1f3752] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  3. Verify &amp; Learn
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Out-of-Band Safety</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Read the challenge question, hear the caller escalate, hang up safely, and reinforce knowledge with interactive teach-back quizzes.
              </p>
            </div>
          </div>

          {/* Scenario Selection Grid (3 Curated Scenarios) */}
          <div className="space-y-4 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1b2b4a] pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Choose a Live Scam Encounter to Simulate
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Click to experience live caller audio and real-time question recommendations.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#15233c] text-amber-300 border border-[#21375d] self-start sm:self-auto">
                Full Flow &lt; 2 Minutes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {SCENARIOS.map((sc) => {
                const isSelected = selectedScenarioId === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`rounded-2xl p-5 text-left border-2 transition-all flex flex-col justify-between group focus-visible:ring-4 focus-visible:ring-amber-300 min-h-[220px] ${
                      isSelected
                        ? "bg-[#16233d] border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.02]"
                        : "bg-[#0f172a] border-[#1e2f52] hover:border-slate-500 hover:bg-[#131d33]"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-[#1d2d4d] border border-slate-700 flex items-center justify-center">
                          {getScenarioIcon(sc.category)}
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {sc.category}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                          {sc.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                          {sc.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">{sc.callerNumber}</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isSelected ? "text-amber-400" : "text-slate-400 group-hover:text-white"
                        }`}
                      >
                        {isSelected ? "Selected ✓" : "Select"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Launch Simulation CTA (min 56px touch target) */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => handleStartSimulation()}
                className="w-full sm:w-auto min-h-[56px] px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 transition-all hover:scale-105 focus-visible:ring-4 focus-visible:ring-amber-300"
              >
                <PhoneCall className="w-6 h-6 stroke-[2.5]" />
                <span>Simulate Call &amp; Hear Voice: {scenario.title}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ACTIVE CALL WORKSPACE: Side-by-side on desktop */}
      {step !== "landing" && (
        <section aria-label="Active Call Simulation" className="space-y-6">
          {/* Top Session Breadcrumb & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#101729] px-4 py-3 rounded-2xl border border-[#1e2d4e]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Live Scenario:
              </span>
              <span className="text-sm font-bold text-white">{scenario.title}</span>
              <span className="hidden sm:inline text-xs text-slate-400">&bull; {scenario.callerNumber}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Play / Test Audio button right in session */}
              <button
                type="button"
                onClick={handlePlayCallerAudio}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#192642] hover:bg-[#22355c] text-amber-300 border border-amber-500/30 transition-colors flex items-center gap-1.5 min-h-[38px]"
                title="Play or replay caller speech"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Voice 🔊</span>
              </button>

              {/* Caller Voice Mute / Unmute Toggle */}
              <button
                type="button"
                onClick={() => setCallerAudioEnabled((prev) => !prev)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 min-h-[38px] ${
                  callerAudioEnabled
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
                title={callerAudioEnabled ? "Mute caller voice" : "Enable caller voice speech"}
              >
                {callerAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{callerAudioEnabled ? "Voice: ON" : "Voice: OFF"}</span>
              </button>

              <button
                type="button"
                onClick={handleReturnToLanding}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5 min-h-[38px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Exit Simulation</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Phone Handset Display */}
            <div className="lg:col-span-7 flex flex-col">
              <PhoneFrame
                attestationRating={scenario.attestationRating}
                attestationDetail={scenario.attestationDetail}
              >
                {/* STEP 2: INCOMING CALL */}
                {step === "incoming" && (
                  <div className="flex-1 flex flex-col justify-between items-center py-6 text-center animate-in fade-in duration-300">
                    <div className="space-y-3 pt-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border-2 border-slate-600 mx-auto flex items-center justify-center text-3xl font-black text-amber-300 shadow-xl animate-pulse">
                        {scenario.callerName[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white">{scenario.callerName}</h3>
                        <p className="text-sm font-mono text-slate-400 mt-1">{scenario.callerNumber}</p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Inbound Telephony Event &bull; Ringing</span>
                      </div>
                    </div>

                    <div className="w-full space-y-4 pt-10">
                      <p className="text-xs text-slate-400">
                        Carrier Warning: {scenario.attestationRating} ({scenario.attestationDetail})
                      </p>
                      <div className="flex items-center justify-center gap-6">
                        {/* Decline Button */}
                        <button
                          type="button"
                          onClick={handleDeclineCall}
                          className="flex flex-col items-center gap-1.5 group focus-visible:ring-4 focus-visible:ring-red-400 rounded-2xl p-2"
                          aria-label="Decline Call"
                        >
                          <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105">
                            <PhoneOff className="w-7 h-7" />
                          </div>
                          <span className="text-xs font-bold text-slate-300">Decline</span>
                        </button>

                        {/* Accept Button */}
                        <button
                          type="button"
                          onClick={handleAcceptCall}
                          className="flex flex-col items-center gap-1.5 group focus-visible:ring-4 focus-visible:ring-emerald-400 rounded-2xl p-2"
                          aria-label="Accept Call"
                        >
                          <div className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 transition-transform group-hover:scale-110 animate-bounce duration-1000">
                            <PhoneCall className="w-7 h-7" />
                          </div>
                          <span className="text-xs font-bold text-emerald-300">Accept &amp; Listen 🔊</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: LIVE CALL */}
                {step === "in_call" && (
                  <div className="flex-1 flex flex-col justify-between space-y-4 animate-in fade-in duration-300">
                    <RiskMeter risk={currentRisk} />

                    <div className="flex-1 min-h-[300px]">
                      <TranscriptFeed
                        lines={displayedLines}
                        callerName={scenario.callerName}
                        isCallActive={true}
                        callSeconds={callTimerSeconds}
                        isCallerSpeaking={isCallerSpeaking}
                        scenarioId={scenario.id}
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>PauseCall AI transcribing live audio stream...</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleHangUpAndVerify}
                        className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors min-h-[44px]"
                      >
                        <PhoneOff className="w-4 h-4" />
                        <span>Hang Up</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: COGNITIVE PAUSE (Hero Moment) */}
                {step === "cognitive_pause" && (
                  <div className="flex-1 flex flex-col justify-between space-y-4 animate-in fade-in duration-300">
                    <RiskMeter risk={currentRisk} />

                    <CognitivePauseCard
                      message={scenario.pauseMessage}
                      onHelpVerify={handleHelpVerify}
                      onKeepListening={handleKeepListening}
                    />

                    {/* Gemini AI Recommendation status pill */}
                    <div className="bg-[#142038] px-3.5 py-2 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-semibold text-amber-300">
                          {isLoadingRecommendations
                            ? `Gemini AI is recommending questions based on ${scenario.callerName}...`
                            : `Questions recommended based on ${scenario.callerName}&apos;s statements!`}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {geminiSource === "gemini" ? "✨ Gemini 2.5" : "⚡ Local SLM"}
                      </span>
                    </div>

                    <div className="max-h-[140px] overflow-hidden opacity-60">
                      <TranscriptFeed
                        lines={displayedLines}
                        callerName={scenario.callerName}
                        isCallActive={false}
                        callSeconds={callTimerSeconds}
                        scenarioId={scenario.id}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: REVERSE CHALLENGE WITH GEMINI RECOMMENDED QUESTIONS & LIVE AUDIO */}
                {step === "reverse_challenge" && (
                  <div className="flex-1 flex flex-col justify-between space-y-4 animate-in fade-in duration-300">
                    <RiskMeter risk={currentRisk} />

                    <ReverseChallenge
                      questions={
                        recommendedQuestions.length > 0
                          ? recommendedQuestions
                          : scenario.verificationQuestions
                      }
                      escalationReply={scenario.escalationReply}
                      escalationWarning={scenario.escalationWarning}
                      primaryActionText={scenario.outOfBandAction.primaryButtonText}
                      actionDetail={scenario.outOfBandAction.actionDetail}
                      scenarioId={scenario.id}
                      geminiSource={geminiSource}
                      onHangUpAndVerify={handleHangUpAndVerify}
                      onCallerEscalated={handleCallerEscalated}
                      onRegenerateQuestions={() => fetchGeminiRecommendations(displayedLines)}
                      isRegenerating={isLoadingRecommendations}
                    />
                  </div>
                )}

                {/* STEP 6: 60-SECOND MICROLEARNING */}
                {step === "micro_learning" && (
                  <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-300">
                    <MicroLearningCard
                      title={scenario.microlearning.title}
                      summary={scenario.microlearning.summary}
                      tactics={scenario.microlearning.tactics}
                      coreRule={scenario.microlearning.coreRule}
                      onContinue={handleMicrolearningComplete}
                    />
                  </div>
                )}

                {/* STEP 7: TEACH-BACK QUIZ */}
                {step === "teach_back" && (
                  <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-300">
                    <TeachBackQuiz
                      question={scenario.teachBack.question}
                      options={scenario.teachBack.options}
                      onComplete={handleTeachBackComplete}
                      muted={muted}
                    />
                  </div>
                )}

                {/* STEP 8: WARM STEWARD PREVIEW */}
                {step === "warm_steward" && (
                  <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-300">
                    <WarmStewardPreview
                      recipient={scenario.warmStewardNotification.recipient}
                      headline={scenario.warmStewardNotification.headline}
                      body={scenario.warmStewardNotification.body}
                      privacyNote={scenario.warmStewardNotification.privacyNote}
                      recommendedAction={scenario.warmStewardNotification.recommendedAction}
                      onRestartScenario={() => handleStartSimulation(scenario.id)}
                      onChooseOtherScenario={handleReturnToLanding}
                    />
                  </div>
                )}
              </PhoneFrame>
            </div>

            {/* Right Column: "What PauseCall Notices" Intelligence Panel */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <SignalPanel signals={accumulatedSignals} />

              {/* Research & Ergonomics Explainer Card */}
              <div className="bg-[#0e1628] rounded-2xl p-5 border border-[#1b2947] text-slate-300 text-xs sm:text-sm space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Recommendations Grounded in Caller Information</span>
                </div>
                <p className="leading-relaxed text-slate-400">
                  When a caller claims authority (e.g. {scenario.callerName}), PauseCall passes their exact statements to Gemini to extract procedural fact gaps.
                </p>
                <div className="bg-[#142036] p-3 rounded-xl border border-slate-800 text-slate-300">
                  <strong className="text-amber-300">Procedural Reverse-Challenge: </strong>
                  By reading the targeted question aloud, the senior forces the fraudster off their script. When the fraudster responds with threats or panic instead of answers, the scam is exposed.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
