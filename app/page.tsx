"use client";

import React, { useState, useEffect } from "react";
import { AccessibleHeader } from "@/components/AccessibleHeader";
import { CallSimulator } from "@/components/CallSimulator";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  const [speed, setSpeed] = useState<"normal" | "fast" | "instant">("normal");
  const [muted, setMuted] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Load saved Gemini API key from localStorage if user configured it
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pausecall_gemini_api_key");
      if (saved) setApiKey(saved);
    }
  }, []);

  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    if (typeof window !== "undefined") {
      if (newKey) {
        localStorage.setItem("pausecall_gemini_api_key", newKey);
      } else {
        localStorage.removeItem("pausecall_gemini_api_key");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090e1a] text-white">
      <AccessibleHeader
        speed={speed}
        onSpeedChange={setSpeed}
        muted={muted}
        onToggleMute={() => setMuted((prev) => !prev)}
        activeTab="simulator"
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />

      <main id="main-content" className="flex-1 flex flex-col">
        <CallSimulator speed={speed} muted={muted} apiKey={apiKey} />
      </main>

      <Footer />
    </div>
  );
}
