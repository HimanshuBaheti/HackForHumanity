Build "PauseCall", a web demo for a hackathon. Judging criteria (25% each): Social Impact, Technology, Polish & Accessibility, Innovation. Theme: "Make AI easier to understand, evaluate, and use with confidence."

## Product
PauseCall helps older adults during scam calls. Existing tools (e.g. Google Pixel Scam Detection, Truecaller) detect scams and say "HANG UP". PauseCall focuses on the human decision AFTER detection: it gives a calm moment to pause, a reverse-challenge question to ask the caller, and a 60-second lesson afterwards. The user stays the decision-maker.
Tagline: "Don't just detect the scam. Help them see it."
Core loop: Detect -> Pause + Verify -> Learn.

This is a SIMULATOR. The browser does NOT intercept real calls. State this honestly in the UI footer and README.

## Stack
Next.js 14 (App Router) + TypeScript + Tailwind. No database. Framer Motion optional. State via React state/useReducer. Deployable to Vercel.

## Screens / flow (one screen = one idea, big type)
1. Landing: title, tagline, scenario picker (3 cards), button "Simulate Incoming Call".
2. Incoming call: phone-style UI, number "+1 (202) 555-0184", label "Government Services Department", buttons Accept / Decline.
3. Live call: transcript lines appear progressively (typewriter, ~2s apart) as "Caller". A side panel "What PauseCall notices" fills in signals as they're detected (Authority, Urgency, Threat, Money request) with a plain-language reason for each. Show a risk meter (Low / Medium / High) with TEXT labels, not colour alone.
4. Cognitive Pause (hero moment): amber calm card, NOT red/flashing. Copy: "This conversation has several warning signs. You don't need to decide right now." Buttons: [Help me verify] [Keep listening].
5. Reverse challenge: "Ask the caller: 'What is your official employee ID and which local office are you calling from?'" Buttons: [I asked them] [Hang up & verify]. On "I asked them", the caller replies with escalating pressure ("You don't have time for this. Transfer the money or you'll be arrested."), risk rises, and a card says "The caller is increasing pressure instead of verifying. End the call and check independently." Primary button: [Hang Up & Verify Official Number].
6. Learning card (60s): "You handled a suspicious call." Show the tactics used (Authority, Urgency, Fear, Financial pressure), each with a one-line explanation, then: "Legitimate organizations don't demand an immediate money transfer over a threatening call."
7. Teach-back: "What should you do if someone calls demanding an immediate transfer?" Three large buttons: A) Transfer quickly B) Stay on the line and give details C) End the call and contact the organization via an official number. Correct = C, with encouraging feedback; wrong answers get a gentle explanation and retry (no shaming).
8. Warm Steward preview: a mock notification for a family member: "A government-impersonation call was safely handled. Maybe check in with a friendly call." No transcript is shared (privacy-preserving).

## Scenarios (scripted JSON in /data/scenarios.ts)
- government: SSA impersonation, arrest threat, transfer savings
- grandchild: AI-voice-clone "grandchild in jail needs bail", secrecy demand, gift cards. Verification: family safe word / private question.
- bank: fake fraud department, "move money to a secure account". Verification: which branch, last two digits of account; call number on your card.
Each scenario has: caller lines, signal triggers, verification question, escalation reply, out-of-band action, lesson text, teach-back question.

## Detection engine (/lib/detect.ts)
Rule-based and deterministic so the demo never fails. Categories: authority impersonation, urgency, threat/fear, money-transfer or gift-card request, secrecy/isolation, credential request. Returns {risk: LOW|MEDIUM|HIGH, signals: [{type, evidence, explanation}], pause_message, verification_question}. Risk increases as signals accumulate across the sliding transcript.

## "Try your own" AI mode
A page /analyze: textarea to paste any call transcript, button "Analyze Conversation". POST /api/analyze calls the Gemini API (GEMINI_API_KEY env var, model configurable via GEMINI_MODEL) with a system prompt that forces JSON-only output in the schema above (plus out_of_band_action and lesson). Strip code fences, validate with zod, and on ANY failure or missing key fall back to the rule engine and show a small "Using offline rules" badge. Never expose the key client-side.

## Design and accessibility (judged heavily)
- Dark slate background, white text, warm amber for caution. No flashing red banners. Red only as a small accent on the final high-risk state, always paired with text and an icon.
- Base font 20px+, sans-serif, line-height 1.5, WCAG AAA contrast (7:1) for body text.
- Touch targets min 56px, generous spacing, one primary action per screen.
- Fully keyboard-navigable, visible focus rings, aria-live for transcript and risk changes, semantic HTML, respects prefers-reduced-motion.
- Optional "Read aloud" button using the Web Speech API (speechSynthesis) on each card.
- Tone: calm, neutral, respectful. Never call the user vulnerable or frail. The AI is an assistant, not a guardian.
- Responsive; looks good in a phone-sized frame on desktop.

## Deliverables
Working app, `npm run dev` runs with no env vars (offline rules mode), `.env.example`, README.md (I'll supply it; don't overwrite), clean component structure (/components, /data, /lib, /app/api/analyze), no dead code, no lorem ipsum.

## Acceptance checklist
- [ ] A judge can complete the full flow for all 3 scenarios in under 2 minutes
- [ ] Pause screen is calm, not alarming
- [ ] Signals show WHY, in plain language
- [ ] Analyze page works with a key AND gracefully without
- [ ] Passes Lighthouse accessibility >= 95
- [ ] Footer states: "Simulation for demonstration; no real calls are recorded or analyzed."

Start by planning the file structure, then build. Run the app and test every scenario before finishing.