"use client";

import React, { useState, useEffect } from "react";
import { Key, Check, X, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey }: ApiKeyModalProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(inputKey.trim());
    setStatusMessage("Key saved successfully! It will now be used for all live recommendations.");
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setInputKey("");
    onSaveKey("");
    setStatusMessage("Key cleared. PauseCall will use the on-device offline rule engine.");
    setTimeout(() => {
      setStatusMessage(null);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
    >
      <div className="bg-[#10172b] border-2 border-amber-500/60 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2b4d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Key className="w-4 h-4" />
            </div>
            <h2 id="api-key-modal-title" className="text-lg font-bold text-white">
              Configure Gemini API Key
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Enter your Google Gemini API key to enable live AI reasoning for reverse-challenge questions and transcript analysis.
          Your key is saved only in your local browser session and sent directly to Google Gemini.
        </p>

        {/* Input */}
        <div className="space-y-1.5">
          <label htmlFor="gemini-key-input" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Gemini API Key</span>
            <span className="text-[11px] text-amber-400 font-mono">Starts with AIza...</span>
          </label>
          <input
            id="gemini-key-input"
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 rounded-xl bg-[#090f1d] border-2 border-[#1f345c] focus:border-amber-400 focus:outline-none text-white text-sm font-mono placeholder:text-slate-600"
          />
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Fallback Notice */}
        <div className="bg-[#131e36] p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
          <span className="text-slate-200 font-semibold block">Optional .env.local support:</span>
          <p>
            You can also set <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">GEMINI_API_KEY=your_key</code> in your project&apos;s <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">.env.local</code> file.
            If left blank, PauseCall seamlessly uses its deterministic on-device offline rule engine.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {apiKey && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Clear Key
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Save Key</span>
          </button>
        </div>
      </div>
    </div>
  );
}
