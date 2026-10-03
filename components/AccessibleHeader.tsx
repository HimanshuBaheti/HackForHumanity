"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Type,
  PhoneCall,
  ShieldCheck,
  Key,
  Sparkles,
  PlayCircle
} from "lucide-react";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { soundManager } from "@/lib/sound";

interface AccessibleHeaderProps {
  speed: "normal" | "fast" | "instant";
  onSpeedChange: (speed: "normal" | "fast" | "instant") => void;
  muted: boolean;
  onToggleMute: () => void;
  activeTab?: "simulator" | "analyze";
  apiKey?: string;
  onApiKeyChange?: (key: string) => void;
}

export function AccessibleHeader({
  speed,
  onSpeedChange,
  muted,
  onToggleMute,
  activeTab = "simulator",
  apiKey = "",
  onApiKeyChange
}: AccessibleHeaderProps) {
  const [largeText, setLargeText] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    if (largeText) {
      document.body.classList.add("text-large");
    } else {
      document.body.classList.remove("text-large");
    }
  }, [largeText]);

  // Audio unlock and test button
  const handleTestVoice = () => {
    setIsTestingVoice(true);
    soundManager.unlockAudio();
    soundManager.speakCaller(
      "Hello! This is a PauseCall audio test. Your sound is working, and you will hear incoming caller voices clearly.",
      "government",
      () => setIsTestingVoice(true),
      () => setIsTestingVoice(false)
    );
  };

  return (
    <header className="border-b border-[#1e2c4a] bg-[#0c1324]/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Mission */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white hover:text-amber-400 transition-colors group focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">PauseCall</span>
                <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI Safeguard
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Don&apos;t just detect the scam. Help them see it.
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation & Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Main Navigation tabs */}
          <nav className="flex items-center bg-[#131d33] p-1 rounded-xl border border-[#1e2c4a]" aria-label="Main Navigation">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                activeTab === "simulator"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Simulator</span>
            </Link>
            <Link
              href="/analyze"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${
                activeTab === "analyze"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Test Your Own AI</span>
            </Link>
          </nav>

          {/* Test Voice & Audio Unlock Button */}
          <button
            type="button"
            onClick={handleTestVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors min-h-[44px] ${
              isTestingVoice
                ? "bg-amber-500 text-slate-950 border-amber-400 font-bold animate-pulse"
                : "bg-[#131d33] text-amber-300 border-[#1e2c4a] hover:bg-[#1a2642] hover:text-white"
            }`}
            title="Click to test and hear the caller voice"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{isTestingVoice ? "Speaking..." : "Test Voice 🔊"}</span>
          </button>

          {/* Gemini API Key Config Button */}
          <button
            type="button"
            onClick={() => setIsKeyModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors min-h-[44px] ${
              apiKey
                ? "bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60"
                : "bg-[#131d33] text-slate-300 border-[#1e2c4a] hover:bg-slate-800 hover:text-white"
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKey ? "Gemini: Configured ✓" : "Gemini Key"}</span>
          </button>

          {/* Speed Toggle for Hackathon Judges */}
          <div className="flex items-center bg-[#131d33] px-2 py-1 rounded-xl border border-[#1e2c4a] text-xs font-medium text-slate-300">
            <span className="hidden sm:inline mr-1.5 text-slate-400">Pacing:</span>
            <button
              type="button"
              onClick={() => onSpeedChange("normal")}
              className={`px-2 py-1 rounded-md transition-colors min-h-[36px] ${
                speed === "normal" ? "bg-amber-500 text-slate-950 font-bold" : "hover:text-white"
              }`}
              title="Natural pacing (~2.8s per line)"
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => onSpeedChange("fast")}
              className={`px-2 py-1 rounded-md transition-colors min-h-[36px] ${
                speed === "fast" ? "bg-amber-500 text-slate-950 font-bold" : "hover:text-white"
              }`}
              title="Fast pacing (~1.4s per line)"
            >
              Fast
            </button>
            <button
              type="button"
              onClick={() => onSpeedChange("instant")}
              className={`px-2 py-1 rounded-md transition-colors min-h-[36px] ${
                speed === "instant" ? "bg-amber-500 text-slate-950 font-bold" : "hover:text-white"
              }`}
              title="Instant lines for judges"
            >
              Instant
            </button>
          </div>

          {/* Font Size Button */}
          <button
            type="button"
            onClick={() => setLargeText((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1e2c4a] text-sm font-semibold transition-colors min-h-[44px] ${
              largeText
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-[#131d33] text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            aria-pressed={largeText}
            aria-label={`Toggle font size, currently ${largeText ? "large" : "standard"}`}
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">{largeText ? "Large" : "20px"}</span>
          </button>

          {/* Audio Chime Mute/Unmute */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`flex items-center justify-center w-11 h-11 rounded-xl border border-[#1e2c4a] transition-colors ${
              muted
                ? "bg-slate-800 text-slate-400"
                : "bg-[#131d33] text-amber-400 hover:text-amber-300 hover:bg-slate-800"
            }`}
            aria-label={muted ? "Unmute audio chimes" : "Mute audio chimes"}
            title={muted ? "Unmute audio" : "Mute audio"}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={(k) => onApiKeyChange?.(k)}
      />
    </header>
  );
}
