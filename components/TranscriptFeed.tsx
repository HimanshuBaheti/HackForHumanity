"use client";

import React, { useEffect, useRef } from "react";
import { User, Volume2 } from "lucide-react";
import type { ScenarioTranscriptLine } from "@/data/scenarios";
import { soundManager } from "@/lib/sound";

interface TranscriptFeedProps {
  lines: ScenarioTranscriptLine[];
  callerName: string;
  isCallActive: boolean;
  callSeconds: number;
  isCallerSpeaking?: boolean;
  scenarioId?: string;
}

export function TranscriptFeed({
  lines,
  callerName,
  isCallActive,
  callSeconds,
  isCallerSpeaking = false,
  scenarioId = "government"
}: TranscriptFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as new lines appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, isCallerSpeaking]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReplayLine = (text: string) => {
    const persona = scenarioId === "grandchild" ? "grandchild" : scenarioId === "bank" ? "bank" : "government";
    soundManager.speakCaller(text, persona as "government" | "grandchild" | "bank" | "default");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Call Header Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1b2844] mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {isCallActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isCallActive ? "bg-emerald-500" : "bg-slate-500"
              }`}
            ></span>
          </span>
          <span className="text-xs font-semibold text-slate-300">
            {isCallActive ? "Call in progress" : "Call paused for verification"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Speaking Animation Badge */}
          {isCallerSpeaking && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-semibold animate-pulse">
              <span className="w-1.5 h-3 bg-amber-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
              <span className="w-1.5 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
              <span className="ml-1">Caller Audio</span>
            </div>
          )}

          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#16233d] text-emerald-300 border border-[#243557]">
            {formatTimer(callSeconds)}
          </span>
        </div>
      </div>

      {/* Transcript Scrolling Body with aria-live */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-1 py-1"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Live call transcript feed"
      >
        {lines.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm italic">
            Connecting audio transcription stream...
          </div>
        )}

        {lines.map((item, idx) => {
          const isLatest = idx === lines.length - 1;
          return (
            <div
              key={item.id}
              className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300 group"
            >
              <div className="flex items-center justify-between w-full text-xs text-slate-400 font-semibold px-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{callerName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleReplayLine(item.text)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1"
                  title="Replay this line audio"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Replay</span>
                </button>
              </div>

              <div
                className={`p-3.5 rounded-2xl rounded-tl-sm border text-sm sm:text-base leading-relaxed max-w-[94%] shadow-sm transition-all ${
                  isLatest && isCallerSpeaking
                    ? "bg-[#182645] text-white border-amber-400/80 ring-2 ring-amber-500/20"
                    : "bg-[#152038] text-white border-[#223559]"
                }`}
              >
                {item.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
