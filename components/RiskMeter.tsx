"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

interface RiskMeterProps {
  risk: "LOW" | "MEDIUM" | "HIGH";
  riskScore?: number;
}

export function RiskMeter({ risk, riskScore }: RiskMeterProps) {
  const getRiskMeta = () => {
    switch (risk) {
      case "HIGH":
        return {
          title: "HIGH RISK OF FRAUD",
          subtitle: "Multiple severe social engineering markers detected",
          badgeBg: "bg-amber-950/80 border-red-500/60 text-amber-200",
          icon: <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />,
          progressColor: "bg-gradient-to-r from-amber-500 to-red-500",
          progressPct: riskScore || 90,
          textColor: "text-amber-200"
        };
      case "MEDIUM":
        return {
          title: "ELEVATED CAUTION ADVISED",
          subtitle: "Suspicious conversational patterns identified",
          badgeBg: "bg-amber-950/60 border-amber-500/50 text-amber-200",
          icon: <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />,
          progressColor: "bg-amber-500",
          progressPct: riskScore || 60,
          textColor: "text-amber-300"
        };
      case "LOW":
      default:
        return {
          title: "MONITORING CALL",
          subtitle: "Listening for pressure, threats, and payment requests",
          badgeBg: "bg-[#131f36] border-[#223558] text-slate-300",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />,
          progressColor: "bg-emerald-500",
          progressPct: riskScore || 20,
          textColor: "text-emerald-300"
        };
    }
  };

  const meta = getRiskMeta();

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-300 ${meta.badgeBg}`}
      role="region"
      aria-label={`Risk Assessment: ${meta.title}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {meta.icon}
          <span className={`text-base font-black tracking-wide uppercase ${meta.textColor}`}>
            {meta.title}
          </span>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-200">
          STATUS: {risk}
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-2.5 font-medium leading-relaxed">
        {meta.subtitle}
      </p>

      {/* Accessible progress meter bar with explicit aria attributes */}
      <div
        className="w-full h-2.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-700/60 p-0.5"
        role="progressbar"
        aria-valuenow={meta.progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Risk Score: ${meta.progressPct} percent`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${meta.progressColor}`}
          style={{ width: `${meta.progressPct}%` }}
        />
      </div>
    </div>
  );
}
