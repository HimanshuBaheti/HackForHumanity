export interface DetectedSignal {
  type: "authority" | "urgency" | "threat" | "financial" | "secrecy" | "credentials";
  label: string;
  evidence: string;
  explanation: string;
}

export interface AnalysisOutput {
  risk: "LOW" | "MEDIUM" | "HIGH";
  riskScore: number; // 0 - 100
  signals: DetectedSignal[];
  pause_message: string;
  verification_questions: string[];
  escalation_warning: string;
  out_of_band_action: string;
  lesson: {
    summary: string;
    tactics: Array<{ name: string; explanation: string }>;
    core_rule: string;
  };
  teach_back: {
    question: string;
    options: Array<{
      text: string;
      is_correct: boolean;
      feedback: string;
    }>;
  };
  source?: "gemini" | "offline_rules";
}

interface PatternRule {
  type: DetectedSignal["type"];
  label: string;
  explanation: string;
  regex: RegExp;
  extractEvidence: (match: RegExpExecArray, text: string) => string;
}

const DETECTION_PATTERNS: PatternRule[] = [
  {
    type: "authority",
    label: "Institutional Impersonation",
    explanation: "Caller claims an official badge, title, or agency authority to compel immediate deference.",
    regex: /(social security|fbi|internal revenue|irs|federal agent|badge number|police|magistrate|sheriff|fraud prevention|first national bank|investigator|inspector|microsoft support|apple care)/i,
    extractEvidence: (m, full) => {
      const idx = m.index;
      const start = Math.max(0, idx - 20);
      const end = Math.min(full.length, idx + m[0].length + 30);
      return full.slice(start, end).trim();
    }
  },
  {
    type: "threat",
    label: "Legal Peril & Fear Triggers",
    explanation: "Threatens arrest, prosecution, account suspension, or physical distress to trigger panic.",
    regex: /(arrest|warrant|jail|court|prosecution|money laundering|narcotics|suspend(ed)?|asset seizure|law enforcement|car accident|in custody|emergency)/i,
    extractEvidence: (m, full) => {
      const idx = m.index;
      const start = Math.max(0, idx - 20);
      const end = Math.min(full.length, idx + m[0].length + 30);
      return full.slice(start, end).trim();
    }
  },
  {
    type: "urgency",
    label: "Manufactured Time Pressure",
    explanation: "Imposes strict countdowns or immediate deadlines to disable analytical deliberation (System 2).",
    regex: /(immediately|right now|within (\d+|the) (hour|minutes)|hurry|urgent|before 2 pm|today only|do not wait|cannot wait)/i,
    extractEvidence: (m, full) => {
      const idx = m.index;
      const start = Math.max(0, idx - 20);
      const end = Math.min(full.length, idx + m[0].length + 30);
      return full.slice(start, end).trim();
    }
  },
  {
    type: "financial",
    label: "Unusual Irrevocable Payment Demand",
    explanation: "Directs funds to third-party accounts, wire transfers, gift cards, or crypto kiosks.",
    regex: /(wire transfer|safe account|escrow|gift card(s)?|target card|apple card|bitcoin|crypto|zelle|venmo|withdraw (your )?savings|bail bond|cash pickup)/i,
    extractEvidence: (m, full) => {
      const idx = m.index;
      const start = Math.max(0, idx - 20);
      const end = Math.min(full.length, idx + m[0].length + 30);
      return full.slice(start, end).trim();
    }
  },
  {
    type: "secrecy",
    label: "Isolation & Anti-Consultation",
    explanation: "Instructs you to keep the call secret, avoid bank tellers, or refrain from hanging up.",
    regex: /(do not hang up|stay on the line|don'?t tell (mom|dad|anyone|family|tellers)|keep this confidential|private matter|between us)/i,
    extractEvidence: (m, full) => {
      const idx = m.index;
      const start = Math.max(0, idx - 20);
      const end = Math.min(full.length, idx + m[0].length + 30);
      return full.slice(start, end).trim();
    }
  },
  {
    type: "credentials",
    label: "Sensitive Credential Solicitation",
    explanation: "Requests passwords, one-time verification codes, PINs, or remote screen control.",
    regex: /(passcode|one-time code|otp|pin number|social security number|ssn|anydesk|teamviewer|remote access|download this app)/i,
    extractEvidence: (m, full) => {
      const idx = m.index;
      const start = Math.max(0, idx - 20);
      const end = Math.min(full.length, idx + m[0].length + 30);
      return full.slice(start, end).trim();
    }
  }
];

export function analyzeTranscriptDeterministically(transcript: string): AnalysisOutput {
  const normalized = transcript.replace(/\s+/g, " ").trim();
  const detectedSignals: DetectedSignal[] = [];
  const matchedTypes = new Set<string>();

  for (const pattern of DETECTION_PATTERNS) {
    const match = pattern.regex.exec(normalized);
    if (match && !matchedTypes.has(pattern.type)) {
      matchedTypes.add(pattern.type);
      detectedSignals.push({
        type: pattern.type,
        label: pattern.label,
        evidence: pattern.extractEvidence(match, normalized),
        explanation: pattern.explanation
      });
    }
  }

  // Calculate Risk Level & Score
  let risk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let riskScore = 15;

  const count = detectedSignals.length;
  const hasMoneyOrThreat = matchedTypes.has("financial") || matchedTypes.has("threat");
  const hasUrgencyOrSecrecy = matchedTypes.has("urgency") || matchedTypes.has("secrecy");
  const hasAuthority = matchedTypes.has("authority");

  if (count >= 3 || (hasMoneyOrThreat && hasUrgencyOrSecrecy) || (hasAuthority && hasMoneyOrThreat)) {
    risk = "HIGH";
    riskScore = Math.min(95, 65 + count * 8);
  } else if (count >= 2 || hasMoneyOrThreat || hasAuthority) {
    risk = "MEDIUM";
    riskScore = Math.min(65, 35 + count * 10);
  } else if (count === 1) {
    risk = "LOW";
    riskScore = 25;
  }

  // Tailor Verification Questions and Guidance based on detected types
  let questions: string[] = [];
  let outOfBandAction = "Hang up the phone immediately and contact the organization or loved one using a known, trusted phone number.";
  let escalationWarning = "The caller responded with heightened pressure or hostility instead of verifying their identity.";

  if (matchedTypes.has("authority") && matchedTypes.has("threat")) {
    // Government / law enforcement
    questions = [
      "What is your official employee badge number and desk extension? I am writing both down to verify.",
      "Which specific regional field office are you calling from, and who is your supervisor on duty?"
    ];
    outOfBandAction = "Disconnect the call now. Call your local municipal police non-emergency line or look up the agency on their verified .gov website.";
    escalationWarning = "The caller reacted aggressively with immediate arrest threats. Legitimate federal agencies never demand instant phone transfers.";
  } else if (matchedTypes.has("financial") || transcript.toLowerCase().includes("bank")) {
    // Banking / safe account
    questions = [
      "Which specific bank branch are you assigned to, and what are the last two digits of the account in question?",
      "What is the official reference ticket ID for this incident so I can call back through the number on my card?"
    ];
    outOfBandAction = "Hang up immediately. Flip your physical debit or credit card over and dial the customer service number printed on the back.";
    escalationWarning = "The caller refused branch verification and demanded urgent wire transfers. Banks never ask you to move funds to protect them.";
  } else if (transcript.toLowerCase().includes("grandma") || transcript.toLowerCase().includes("grandpa") || matchedTypes.has("threat")) {
    // Family emergency / Voice Clone
    questions = [
      "Before we proceed, what is our secret family safe word, or what was the name of our childhood pet?",
      "What is your mother's middle name and what city did we visit together last summer?"
    ];
    outOfBandAction = "Hang up immediately. Open your phone contacts and dial your family member's saved number directly, or call their parents.";
    escalationWarning = "The caller avoided the private biographical check and applied emotional guilt. A real loved one would answer the safe word.";
  } else {
    // General suspicious call
    questions = [
      "What is your direct employee callback number, badge ID, and the official case reference number?",
      "Can you mail official written documentation of this matter to my address on file?"
    ];
    outOfBandAction = "Disconnect the call. Independently verify the caller's organization through an official directory or website.";
  }

  const pauseMessage =
    risk === "HIGH"
      ? "This conversation contains multiple severe warning signs of fraudulent manipulation. You do not need to make any decision right now."
      : risk === "MEDIUM"
      ? "Several cautionary patterns have been identified. Take a calm pause before sharing any sensitive details."
      : "PauseCall is actively monitoring this call. Everything appears calm so far.";

  const tactics = detectedSignals.map((s) => ({
    name: s.label,
    explanation: s.explanation
  }));

  if (tactics.length === 0) {
    tactics.push({
      name: "Conversational Monitoring",
      explanation: "No overt manipulation indicators detected in this excerpt."
    });
  }

  return {
    risk,
    riskScore,
    signals: detectedSignals,
    pause_message: pauseMessage,
    verification_questions: questions,
    escalation_warning: escalationWarning,
    out_of_band_action: outOfBandAction,
    lesson: {
      summary: "Fraudsters systematically engineer emotional panic, authority pressure, and manufactured deadlines to hijack deliberate reasoning.",
      tactics,
      core_rule: "Legitimate organizations and family members will never penalize you for pausing, hanging up, and verifying over a known official channel."
    },
    teach_back: {
      question: "What is the single safest action to take when an unexpected caller demands immediate financial action or sensitive information?",
      options: [
        {
          text: "Send a small test payment to see if they are legitimate",
          is_correct: false,
          feedback: "Scammers take whatever funds they can get. Any payment marks your number as a high-value victim."
        },
        {
          text: "End the call calmly and contact the official entity via a known directory number",
          is_correct: true,
          feedback: "Spot on! The 'Hang Up & Verify Out-of-Band' rule puts you back in complete control."
        },
        {
          text: "Stay on the line and argue until they prove their credentials",
          is_correct: false,
          feedback: "Staying on the line keeps you exposed to skilled social engineers who use fatigue to break down resistance."
        }
      ]
    },
    source: "offline_rules"
  };
}
