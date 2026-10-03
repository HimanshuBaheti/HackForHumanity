import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGeminiOrFallback } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript = body?.transcript;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: "A non-empty 'transcript' string is required for analysis." },
        { status: 400 }
      );
    }

    const headerKey = req.headers.get("x-gemini-api-key")?.trim();
    const bodyKey = body?.apiKey?.trim();
    const customKey = headerKey || bodyKey;

    const result = await analyzeWithGeminiOrFallback(transcript, customKey);
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("[PauseCall API Error]:", err);
    return NextResponse.json(
      { error: "Internal server error occurred while analyzing the transcript." },
      { status: 500 }
    );
  }
}
