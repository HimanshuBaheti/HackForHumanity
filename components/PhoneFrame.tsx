"use client";

import React from "react";
import { Wifi, BatteryMedium, Signal, ShieldAlert, ShieldCheck } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
  attestationRating?: string;
  attestationDetail?: string;
}

export function PhoneFrame({ children, attestationRating, attestationDetail }: PhoneFrameProps) {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col bg-[#0b1120] rounded-[2.5rem] border-[6px] border-[#1e2c4a] shadow-2xl overflow-hidden transition-all duration-300">
      {/* Phone Top Bezel / Status Bar */}
      <div className="bg-[#0e1628] px-6 pt-3 pb-2 flex items-center justify-between text-xs text-slate-400 border-b border-[#1b263e] select-none">
        <span className="font-semibold text-white tracking-wide">10:42 AM</span>
        
        {/* Dynamic Island / Speaker cutout */}
        <div className="h-4 w-28 bg-[#070b14] rounded-full mx-auto flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#18233c] mr-2"></div>
          <div className="w-10 h-1 bg-[#18233c] rounded-full"></div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300">
          <Signal className="w-3.5 h-3.5" />
          <span className="text-[10px] font-mono">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* STIR/SHAKEN Telephony Carrier Attestation Header Pill (From research paper) */}
      {attestationRating && (
        <div className="bg-[#121c33] px-4 py-2 border-b border-[#1b2742] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">{attestationRating}</span>
          </div>
          <span className="text-[11px] text-slate-400 truncate max-w-[190px]" title={attestationDetail}>
            {attestationDetail || "Unverified Gateway"}
          </span>
        </div>
      )}

      {/* Phone Screen Canvas */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 min-h-[580px] bg-[#0c1222] relative">
        {children}
      </div>

      {/* Bottom Navigation Indicator Bar */}
      <div className="bg-[#0b1120] py-2 flex justify-center border-t border-[#162035]">
        <div className="w-32 h-1 bg-slate-600 rounded-full"></div>
      </div>
    </div>
  );
}
