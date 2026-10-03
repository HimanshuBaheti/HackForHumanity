import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { analyzeTranscriptDeterministically, type AnalysisOutput } from "./detect";

export const AnalysisSchema = z.object({
  risk: z.enum(["LOW", "MEDIUM", "HIGH"]),
  riskScore: z.number().min(0).max(100),
  signals: z.array(
    z.object({
      type: z.enum(["authority", "urgency", "threat", "financial", "secrecy", "credentials"]),
      label: z.string(),
      evidence: z.string(),
      explanation: z.string()
    })
  ),
  pause_message: z.string(),
  verification_questions: z.array(z.string()).min(1),
  escalation_warning: z.string(),
  out_of_band_action: z.string(),
  lesson: z.object({
    summary: z.string(),
    tactics: z.array(
      z.object({
        name: z.string(),
        explanation: z.string()
      })
    ),
    core_rule: z.string()
  }),
  teach_back: z.object({
    question: z.string(),
    options: z.array(
      z.object({
        text: z.string(),
        is_correct: z.boolean(),
        feedback: z.string()
      })
    ).min(2)
  })
});

const SYSTEM_PROMPT = `You are PauseCall, an empathetic, dignified AI concierge specializing in protecting older adults from telephone fraud, generative voice scams, and conversational social engineering.

Your mission is based on dual-process cognitive ergonomics:
1. Transition the user from an emotionally aroused System 1 state (fear, panic, urgency) into a calm, deliberative System 2 state through a structured "Cognitive Pause".
2. Respect Dignity and Autonomy: Never speak in a patronizing tone or label the user as frail or vulnerable. Position yourself as an administrative executive assistant verifying procedural facts.
3. Recommend targeted "Reverse-Challenge Questions": Create questions that exploit the fraudster's information asymmetry (e.g. employee badge number, desk extension, family safe word, physical branch location). Fraud syndicates rely on rigid scripts and panic, and will fail these specific procedural checks.
4. Prescribe a clear Out-of-Band (OOB) verification action (e.g. hang up and call the number on the back of your card, or dial the saved family contact).
5. Provide a 60-second microlearning summary and an interactive 3-option teach-back question using clinical teach-back methodology for lasting retention (with one clearly correct option and encouraging feedback for all choices, no shaming).

Output MUST be raw valid JSON matching this schema:
{
  "risk": "LOW" | "MEDIUM" | "HIGH",
  "riskScore": number (0-100),
  "signals": [
    {
      "type": "authority" | "urgency" | "threat" | "financial" | "secrecy" | "credentials",
      "label": "Short Plain Title",
      "evidence": "Quoted excerpt from transcript",
      "explanation": "Plain-language reason why this tactic is manipulative"
    }
  ],
  "pause_message": "Calm, respectful pause message reassuring the user that they do not need to make an immediate decision",
  "verification_questions": [
    "Question 1 for the user to read to the caller",
    "Question 2 for the user to read to the caller"
  ],
  "escalation_warning": "What to expect if the caller reacts with aggression or pressure instead of answers",
  "out_of_band_action": "Clear instructions on how to hang up and verify independently",
  "lesson": {
    "summary": "Concise 1-2 sentence lesson",
    "tactics": [
      { "name": "Tactic Name", "explanation": "Why fraudsters use it" }
    ],
    "core_rule": "The essential golden rule to remember"
  },
  "teach_back": {
    "question": "Realistic scenario-based reinforcement question",
    "options": [
      { "text": "Option A text", "is_correct": false, "feedback": "Gentle, non-shaming explanation" },
      { "text": "Option B text", "is_correct": true, "feedback": "Encouraging affirmation of correct concept" },
      { "text": "Option C text", "is_correct": false, "feedback": "Gentle, non-shaming explanation" }
    ]
  }
}
Return ONLY JSON without markdown quotes or formatting.`;

export async function analyzeWithGeminiOrFallback(transcript: string, customApiKey?: string): Promise<AnalysisOutput> {
  const apiKey = customApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  // If no API key is provided, gracefully use the deterministic rule engine
  if (!apiKey) {
    console.log("[PauseCall] No GEMINI_API_KEY found. Using deterministic offline rule engine.");
    return analyzeTranscriptDeterministically(transcript);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze this inbound phone call / message transcript:\n\n"""\n${transcript}\n"""`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json"
      }
    });

    const rawText = response.text || "";
    // Clean potential code fences
    const cleanedText = rawText
      .replace(/^```(json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsedJson = JSON.parse(cleanedText);
    const validated = AnalysisSchema.parse(parsedJson);

    return {
      ...validated,
      source: "gemini"
    };
  } catch (error) {
    console.warn("[PauseCall] Gemini API call or parsing failed, falling back to deterministic offline rules:", error);
    const fallback = analyzeTranscriptDeterministically(transcript);
    return {
      ...fallback,
      source: "offline_rules"
    };
  }
}
