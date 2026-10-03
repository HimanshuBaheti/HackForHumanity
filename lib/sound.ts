// Web Audio API synthesizers and Robust Speech Synthesis with Chromium & Safari fixes
class SoundManager {
  private ctx: AudioContext | null = null;
  private ringInterval: ReturnType<typeof setInterval> | null = null;
  private voicesLoaded: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Warm up voices cache
      const loadVoices = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
        if (this.cachedVoices.length > 0) {
          this.voicesLoaded = true;
        }
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  public getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Explicitly unlock audio on user gesture (click)
  public unlockAudio() {
    if (typeof window === "undefined") return;

    // Unlock Web Audio Context
    const ctx = this.getContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // Unlock SpeechSynthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.resume();
      // Speak a silent or brief test if stuck
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }

  // Low-frequency calming double chime (523 Hz -> 659 Hz)
  playCognitiveChime(muted: boolean = false) {
    if (muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Tone 1: 523.25 Hz (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.85);

      // Tone 2: 659.25 Hz (E5) after 160ms
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now + 0.16);
      gain2.gain.setValueAtTime(0, now + 0.16);
      gain2.gain.linearRampToValueAtTime(0.24, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.16);
      osc2.stop(now + 1.25);

      this.triggerHaptic();
    } catch (e) {
      console.warn("Could not play audio chime", e);
    }
  }

  // Encouraging triad for successful quiz completion
  playSuccessChime(muted: boolean = false) {
    if (muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.65);
      });
    } catch {
      // Audio policy
    }
  }

  // Incoming phone ring simulation
  startPhoneRingtone(muted: boolean = false) {
    if (muted) return;
    this.stopPhoneRingtone();
    const ctx = this.getContext();
    if (!ctx) return;

    const ring = () => {
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.setValueAtTime(0.12, now + 1.2);
        gain.gain.linearRampToValueAtTime(0, now + 1.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.35);
      } catch {
        // Audio policy
      }
    };

    ring();
    this.ringInterval = setInterval(ring, 3000);
  }

  stopPhoneRingtone() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  triggerHaptic() {
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      try {
        navigator.vibrate([70, 80, 90]);
      } catch {}
    }
  }

  // Speak caller's voice with persona settings (pitch, rate)
  speakCaller(
    text: string,
    persona: "government" | "grandchild" | "bank" | "default" = "default",
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }

    try {
      // Resume if Chrome paused it
      window.speechSynthesis.resume();

      // Clean up previous utterances
      window.speechSynthesis.cancel();

      // Small delay prevents Chromium cancel-and-speak race condition
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.volume = 1.0;

          // Persona-based vocal tuning
          switch (persona) {
            case "government":
              // Deeper, stern authority
              utterance.pitch = 0.82;
              utterance.rate = 0.95;
              break;
            case "grandchild":
              // Anxious youth
              utterance.pitch = 1.28;
              utterance.rate = 1.08;
              break;
            case "bank":
              // Corporate alert
              utterance.pitch = 0.98;
              utterance.rate = 1.0;
              break;
            default:
              utterance.pitch = 1.0;
              utterance.rate = 1.0;
              break;
          }

          // Pick appropriate voice if loaded
          const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            const enVoices = voices.filter((v) => v.lang.startsWith("en"));
            if (persona === "grandchild") {
              const youthVoice = enVoices.find((v) =>
                /junior|samantha|victoria|karen|female|ava/i.test(v.name)
              );
              if (youthVoice) utterance.voice = youthVoice;
              else if (enVoices[0]) utterance.voice = enVoices[0];
            } else if (persona === "government") {
              const deepVoice = enVoices.find((v) =>
                /daniel|alex|fred|male|george|oliver|guy/i.test(v.name)
              );
              if (deepVoice) utterance.voice = deepVoice;
              else if (enVoices[0]) utterance.voice = enVoices[0];
            } else {
              if (enVoices[0]) utterance.voice = enVoices[0];
            }
          }

          utterance.onstart = () => {
            onStart?.();
          };

          const handleFinish = () => {
            (window as unknown as { _activeUtterance?: unknown })._activeUtterance = null;
            onEnd?.();
          };

          utterance.onend = handleFinish;
          utterance.onerror = handleFinish;

          // CRITICAL CHROMIUM BUG FIX:
          // Pin utterance to window object to prevent Garbage Collection from aborting speech mid-sentence
          (window as unknown as { _activeUtterance?: unknown })._activeUtterance = utterance;

          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn("speechSynthesis.speak failed:", e);
          onEnd?.();
        }
      }, 50);
    } catch (err) {
      console.warn("speakCaller error:", err);
      onEnd?.();
    }
  }

  // Web Speech API text-to-speech for read-aloud
  speak(text: string, onEnd?: () => void) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        const handleFinish = () => {
          (window as unknown as { _activeUtterance?: unknown })._activeUtterance = null;
          onEnd?.();
        };

        utterance.onend = handleFinish;
        utterance.onerror = handleFinish;

        (window as unknown as { _activeUtterance?: unknown })._activeUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch {
      onEnd?.();
    }
  }

  stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      (window as unknown as { _activeUtterance?: unknown })._activeUtterance = null;
    }
  }

  isSpeaking(): boolean {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
    return window.speechSynthesis.speaking;
  }
}

export const soundManager = new SoundManager();
