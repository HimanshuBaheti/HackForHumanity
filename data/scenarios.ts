export interface ScenarioTranscriptLine {
  id: string;
  speaker: "caller" | "senior";
  text: string;
  delayMs?: number;
  triggerSignal?: {
    type: "authority" | "urgency" | "threat" | "financial" | "secrecy" | "credentials";
    label: string;
    evidence: string;
    explanation: string;
  };
  triggerRisk?: "LOW" | "MEDIUM" | "HIGH";
}

export interface Scenario {
  id: string;
  title: string;
  tagline: string;
  category: "Government" | "Family Emergency" | "Financial / Bank" | "Tech Support";
  callerName: string;
  callerNumber: string;
  attestationRating: string; // From STIR/SHAKEN paper (Level A, B, C)
  attestationDetail: string;
  avatarColor: string;
  transcriptLines: ScenarioTranscriptLine[];
  cognitivePauseTriggerIndex: number; // After which line the cognitive pause appears
  pauseMessage: string;
  verificationQuestions: string[];
  escalationReply: string;
  escalationWarning: string;
  outOfBandAction: {
    primaryButtonText: string;
    actionDetail: string;
    trustedContactName?: string;
  };
  microlearning: {
    title: string;
    summary: string;
    tactics: Array<{
      name: string;
      badge: string;
      description: string;
    }>;
    coreRule: string;
  };
  teachBack: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
      feedback: string;
    }>;
  };
  warmStewardNotification: {
    recipient: string;
    headline: string;
    body: string;
    privacyNote: string;
    recommendedAction: string;
  };
}

export const SCENARIOS: Scenario[] = [
  {
    id: "government",
    title: "Federal Agency Impersonation",
    tagline: "Claims your Social Security number is linked to financial crime and threatens immediate arrest.",
    category: "Government",
    callerName: "Social Security Admin - Investigation Unit",
    callerNumber: "+1 (202) 555-0184",
    attestationRating: "Level C Gateway Attestation",
    attestationDetail: "Unverified international transit route with spoofed caller ID",
    avatarColor: "from-blue-600 to-indigo-800",
    cognitivePauseTriggerIndex: 3,
    transcriptLines: [
      {
        id: "gov-1",
        speaker: "caller",
        text: "Hello, this is Senior Inspector Davis from the Federal Bureau of Investigation, contacting you alongside the Social Security Administration.",
        triggerSignal: {
          type: "authority",
          label: "Institutional Impersonation",
          evidence: "Senior Inspector Davis from FBI and Social Security Administration",
          explanation: "Scammers use badges and government titles to bypass your critical scrutiny."
        },
        triggerRisk: "LOW"
      },
      {
        id: "gov-2",
        speaker: "caller",
        text: "Your Social Security number has been identified in an interstate narcotics and money laundering operation on the southern border.",
        triggerSignal: {
          type: "threat",
          label: "Legal Peril & Criminal Allegation",
          evidence: "SSN identified in narcotics and money laundering",
          explanation: "Frightening criminal accusations are engineered to trigger emotional fight-or-flight panic."
        },
        triggerRisk: "MEDIUM"
      },
      {
        id: "gov-3",
        speaker: "caller",
        text: "A federal magistrate has signed an active warrant for your arrest within the next 45 minutes unless we verify your identity.",
        triggerSignal: {
          type: "urgency",
          label: "Manufactured Time Urgency",
          evidence: "Active warrant for your arrest within 45 minutes",
          explanation: "Strict time compression prevents you from thinking clearly or consulting family."
        },
        triggerRisk: "HIGH"
      },
      {
        id: "gov-4",
        speaker: "caller",
        text: "To preserve your savings from immediate asset seizure, you must withdraw your balance and transfer it to a temporary secure federal escrow account.",
        triggerSignal: {
          type: "financial",
          label: "Irrevocable Funds Transfer Request",
          evidence: "Withdraw balance and transfer to temporary federal escrow",
          explanation: "Real government agencies never demand money transfers or escrow deposits over the phone."
        },
        triggerRisk: "HIGH"
      },
      {
        id: "gov-5",
        speaker: "caller",
        text: "Do not hang up this call or speak with anyone in your house. If the line drops, federal marshals will arrive at your door immediately.",
        triggerSignal: {
          type: "secrecy",
          label: "Behavioral Isolation & Secrecy",
          evidence: "Do not hang up or speak with anyone in your house",
          explanation: "Demands for secrecy are designed to cut you off from trusted advice."
        },
        triggerRisk: "HIGH"
      }
    ],
    pauseMessage: "This conversation has several hallmark warning signs of government impersonation. You do not need to make any decision right now.",
    verificationQuestions: [
      "What is your official employee badge number and desk extension? I am writing both down to verify.",
      "Which specific federal field office are you calling from, and who is your regional supervisor?"
    ],
    escalationReply: "Sir, you do NOT have time to write notes! If you hang up this phone, federal marshals will be dispatched to your address immediately! Go to your bank right now!",
    escalationWarning: "The caller reacted with aggressive threats instead of providing verifiable credentials. Official agencies never behave this way.",
    outOfBandAction: {
      primaryButtonText: "Hang Up & Verify Official Agency",
      actionDetail: "Hang up safely. Disconnect the call and look up the Social Security Administration on ssa.gov or contact your local police non-emergency line.",
      trustedContactName: "Local Police / SSA Official Directory"
    },
    microlearning: {
      title: "How Government Impersonation Works",
      summary: "Scammers systematically pose as IRS agents, federal marshals, or SSA investigators to induce panic. Under stress, your brain's emotional center takes over.",
      tactics: [
        {
          name: "Badge & Title Intimidation",
          badge: "Authority",
          description: "Citing fake badge numbers and federal statutes to demand instant obedience."
        },
        {
          name: "The 'Safe Escrow' Trap",
          badge: "Financial",
          description: "Claiming your bank account is compromised and must be moved to a government account."
        },
        {
          name: "Strict Isolation Rules",
          badge: "Secrecy",
          description: "Threatening arrest if you speak to spouses, children, or bank tellers."
        }
      ],
      coreRule: "Official government agencies communicate legal matters by official postal mail. They NEVER threaten same-day arrest or request phone money transfers."
    },
    teachBack: {
      question: "If someone calls claiming to be a federal officer threatening arrest unless you wire funds to a safe account, what is your safest move?",
      options: [
        {
          id: "opt-1",
          text: "Transfer a small portion first to see if they are telling the truth",
          isCorrect: false,
          feedback: "Scammers count on taking any money they can get. Never send funds to unverified callers."
        },
        {
          id: "opt-2",
          text: "Stay on the line and ask them to transfer you to their supervisor",
          isCorrect: false,
          feedback: "Scam syndicates work in pairs; another person will simply pick up the phone posing as the boss."
        },
        {
          id: "opt-3",
          text: "End the call calmly and contact the agency or local police via a verified directory number",
          isCorrect: true,
          feedback: "Spot on! Taking a pause and hanging up completely neutralizes the scammer's psychological pressure."
        }
      ]
    },
    warmStewardNotification: {
      recipient: "Daughter Sarah (Designated Contact)",
      headline: "PauseCall Protected Mom's Phone",
      body: "A high-risk government impersonation call was safely intercepted and ended. Mom took a cognitive pause and hung up safely.",
      privacyNote: "Zero voice recordings or call transcripts were uploaded or saved. Your loved one's privacy and dignity remain completely protected.",
      recommendedAction: "Give Mom a warm, supportive phone check-in to ask about her day!"
    }
  },
  {
    id: "grandchild",
    title: "AI Voice-Clone Family Emergency",
    tagline: "A synthetic voice mimicking a grandchild claims an out-of-state car accident and demands urgent bail.",
    category: "Family Emergency",
    callerName: "Alex (Grandson)",
    callerNumber: "+1 (415) 555-0193",
    attestationRating: "Level C Gateway Attestation",
    attestationDetail: "Spoofed VoIP line mimicking local area code",
    avatarColor: "from-amber-600 to-orange-800",
    cognitivePauseTriggerIndex: 3,
    transcriptLines: [
      {
        id: "fam-1",
        speaker: "caller",
        text: "Grandma? It's Alex... please help me, I am in serious trouble and I didn't know who else to turn to.",
        triggerSignal: {
          type: "authority",
          label: "Familial Impersonation (AI Voice Clone)",
          evidence: "Grandma? It's Alex... please help me",
          explanation: "AI voice cloning replicates the exact voice pitch and speech cadence of loved ones from short online clips."
        },
        triggerRisk: "LOW"
      },
      {
        id: "fam-2",
        speaker: "caller",
        text: "I was driving home late last night with friends and got into a terrible car crash. The other driver is in the hospital and the police arrested me.",
        triggerSignal: {
          type: "threat",
          label: "Severe Acute Crisis",
          evidence: "Terrible car crash, other driver in hospital, police arrested me",
          explanation: "Triggers acute protective instincts, causing working memory constriction."
        },
        triggerRisk: "MEDIUM"
      },
      {
        id: "fam-3",
        speaker: "caller",
        text: "The public defender says I need $4,500 cash for bail bond right now before 2 PM or they are moving me to the county detention facility.",
        triggerSignal: {
          type: "urgency",
          label: "Impending Custody Deadline",
          evidence: "Need $4,500 bail bond before 2 PM",
          explanation: "Manufactures an immediate deadline to force instant money transfer before checking facts."
        },
        triggerRisk: "HIGH"
      },
      {
        id: "fam-4",
        speaker: "caller",
        text: "Please don't tell Mom and Dad, they would be so furious with me. Can you go to the pharmacy, get retail gift cards or do a money transfer app?",
        triggerSignal: {
          type: "financial",
          label: "Unusual Untraceable Payment Demand",
          evidence: "Pharmacy retail gift cards or money transfer app",
          explanation: "Bail bondsmen and municipal courts never accept gift cards or peer-to-peer app payments."
        },
        triggerRisk: "HIGH"
      },
      {
        id: "fam-5",
        speaker: "caller",
        text: "The guard is standing right here and says they're taking my phone away in twenty seconds! Grandma, hurry!",
        triggerSignal: {
          type: "secrecy",
          label: "Panic Induction & Time Squeeze",
          evidence: "Guard is standing right here, taking phone away in twenty seconds",
          explanation: "Prevents you from taking even a 30-second breath to dial the grandchild's parents."
        },
        triggerRisk: "HIGH"
      }
    ],
    pauseMessage: "This call exhibits the exact pattern of an AI voice-cloning emergency scam. Pause and breathe: real emergencies can withstand two minutes of verification.",
    verificationQuestions: [
      "Before we proceed, what is our secret family safe word, or what was the name of our childhood dog on Maple Street?",
      "What is your mother's middle name and what did we eat together last Thanksgiving?"
    ],
    escalationReply: "Grandma, why are you asking me ridiculous trivia questions?! I'm bleeding in a jail cell! If you don't get the money right now they are throwing me in solitary!",
    escalationWarning: "The caller dodged the private biographical question and attacked with guilt. A real family member would answer the safe word.",
    outOfBandAction: {
      primaryButtonText: "Hang Up & Call Alex Directly",
      actionDetail: "Hang up immediately. Tap your contacts and dial Alex's known, saved phone number directly, or call his parents to confirm his location.",
      trustedContactName: "Alex (Saved Mobile Contact)"
    },
    microlearning: {
      title: "Defeating AI Voice Impersonations",
      summary: "Modern AI models can clone any human voice with just 3 to 10 seconds of audio harvested from social media or voicemail greetings.",
      tactics: [
        {
          name: "Generative Audio Deception",
          badge: "AI Clone",
          description: "Using synthetic voice models to simulate the tone, pitch, and distress of family members."
        },
        {
          name: "Weaponized Affection",
          badge: "Emotional",
          description: "Scammers exploit your deep love and protective instinct to disable analytical scrutiny."
        },
        {
          name: "Secrecy & Guilt Manipulation",
          badge: "Secrecy",
          description: "Saying 'Don't tell Mom and Dad' ensures other family members don't expose the lie."
        }
      ],
      coreRule: "Establish a private 'Family Safe Word' that is never written down online. If an emergency caller cannot say the safe word, it is an impersonation."
    },
    teachBack: {
      question: "If someone sounding just like your grandchild calls crying from an unknown number asking for bail money via gift cards, what should you do first?",
      options: [
        {
          id: "opt-1",
          text: "Rush to the store to purchase the cards before they get transferred to jail",
          isCorrect: false,
          feedback: "Courts and police stations never accept gift cards for bail. That is a 100% scam signature."
        },
        {
          id: "opt-2",
          text: "Ask for your private family safe word, or hang up and dial their saved phone number directly",
          isCorrect: true,
          feedback: "Excellent! Calling back on the verified phone number saved in your phone immediately proves where your family really is."
        },
        {
          id: "opt-3",
          text: "Wire money to the public defender's personal account",
          isCorrect: false,
          feedback: "Bail is handled by official county court clerks in person, never over personal transfer apps."
        }
      ]
    },
    warmStewardNotification: {
      recipient: "Son Mark (Designated Family Contact)",
      headline: "PauseCall Intercepted a Grandchild Impersonation Call",
      body: "A caller using synthetic voice cloning posing as Alex was detected. Mom asked the family challenge question and ended the call safely.",
      privacyNote: "No conversational audio or text was saved outside Mom's handset. Her communications remain private.",
      recommendedAction: "Call Mom to reassure her and confirm that Alex is safe at school/work."
    }
  },
  {
    id: "bank",
    title: "Bank Fraud Department Impersonation",
    tagline: "Alerts of fraudulent transactions, claiming you must move funds into a 'safe holding account'.",
    category: "Financial / Bank",
    callerName: "First National Bank - Fraud Division",
    callerNumber: "+1 (800) 555-0149",
    attestationRating: "Level B Partial Attestation",
    attestationDetail: "Verified VoIP service provider, but caller identity and intent unverified",
    avatarColor: "from-emerald-600 to-teal-800",
    cognitivePauseTriggerIndex: 3,
    transcriptLines: [
      {
        id: "bnk-1",
        speaker: "caller",
        text: "This is Jonathan Miller from your bank's Senior Fraud Prevention and Security Division.",
        triggerSignal: {
          type: "authority",
          label: "Financial Institution Impersonation",
          evidence: "Senior Fraud Prevention and Security Division",
          explanation: "Fraud syndicates mimic official bank departments to establish instant credibility."
        },
        triggerRisk: "LOW"
      },
      {
        id: "bnk-2",
        speaker: "caller",
        text: "We have intercepted three unauthorized wire transactions totaling $6,200 originating from an IP address in overseas servers.",
        triggerSignal: {
          type: "threat",
          label: "Fabricated Financial Loss",
          evidence: "Three unauthorized wire transactions totaling $6,200 overseas",
          explanation: "Fabricating active theft causes intense loss aversion and cognitive tunneling."
        },
        triggerRisk: "MEDIUM"
      },
      {
        id: "bnk-3",
        speaker: "caller",
        text: "Your routing credentials are fully compromised. If we do not act within the next 20 minutes, your remaining savings will be cleared out.",
        triggerSignal: {
          type: "urgency",
          label: "Urgent Account Liquidation Threat",
          evidence: "Act within the next 20 minutes or remaining savings cleared out",
          explanation: "Imposing tight time windows forces impulsive System 1 agreement."
        },
        triggerRisk: "HIGH"
      },
      {
        id: "bnk-4",
        speaker: "caller",
        text: "To protect your money, our fraud team has created a temporary FDIC-insured 'safe reserve account'. We need you to transfer your balance there immediately.",
        triggerSignal: {
          type: "financial",
          label: "Classic 'Safe Account' Deception",
          evidence: "Transfer balance to temporary FDIC-insured safe reserve account",
          explanation: "Banks NEVER create external accounts for you to wire money to. The 'safe account' belongs to criminals."
        },
        triggerRisk: "HIGH"
      },
      {
        id: "bnk-5",
        speaker: "caller",
        text: "Stay on the line while you log in. If you visit a branch, do not tell the tellers—internal bank employees might be complicit in the breach.",
        triggerSignal: {
          type: "secrecy",
          label: "Bank Teller Circumvention Directive",
          evidence: "Do not tell the tellers, employees might be complicit",
          explanation: "Scammers know bank tellers are legally trained to detect scams and stop fraudulent wires."
        },
        triggerRisk: "HIGH"
      }
    ],
    pauseMessage: "This call exhibits the hallmark pattern of a 'Safe Account' bank fraud scheme. Real banks never instruct customers to wire money to protect it.",
    verificationQuestions: [
      "Which specific bank branch location are you based at, and what are the last two digits of the account you claim is compromised?",
      "What is your internal employee ID number? I am hanging up to call the number on my card."
    ],
    escalationReply: "Ma'am! Due to federal banking secrecy laws I cannot reveal internal branch details! While you are hesitating, the fraudsters are draining another $2,000! Wire the funds to the safe vault now!",
    escalationWarning: "The caller refused branch details and intensified the pressure. Real fraud agents freeze cards—they never tell you to wire funds.",
    outOfBandAction: {
      primaryButtonText: "Hang Up & Call Number on Bank Card",
      actionDetail: "Hang up immediately. Take your physical debit or credit card, flip it over, and dial the customer service phone number printed directly on the plastic card.",
      trustedContactName: "Bank Customer Care (Back of Physical Card)"
    },
    microlearning: {
      title: "Understanding the 'Safe Account' Scam",
      summary: "One of the most financially damaging schemes targeting older adults involves tricking targets into 'protecting' their own money by sending it directly to thieves.",
      tactics: [
        {
          name: "The 'Safe Reserve' Myth",
          badge: "Deception",
          description: "Legitimate financial institutions freeze compromised accounts internally. They NEVER instruct customers to move money."
        },
        {
          name: "Sowing Mistrust in Local Staff",
          badge: "Isolation",
          description: "Telling you that branch tellers are corrupt prevents you from asking for in-person advice."
        },
        {
          name: "Urgency over Procedure",
          badge: "Pressure",
          description: "Forcing instant electronic transfers while keeping you on the telephone line."
        }
      ],
      coreRule: "Turn your card over. The only legitimate number for your bank is the one printed on your physical card or monthly printed bank statement."
    },
    teachBack: {
      question: "Someone calling from your bank says your checking account is hacked and you must wire your money to a 'safe holding account'. What do you do?",
      options: [
        {
          id: "opt-1",
          text: "Follow their instructions right away so your savings are protected by FDIC",
          isCorrect: false,
          feedback: "The FDIC does not operate emergency wire accounts. The recipient account is controlled by scammers."
        },
        {
          id: "opt-2",
          text: "Hang up, turn your physical bank card over, and dial the customer service number on the back",
          isCorrect: true,
          feedback: "Spot on! That simple action connects you directly to your real bank's verified fraud team."
        },
        {
          id: "opt-3",
          text: "Visit the bank branch but keep the caller on speakerphone in your pocket",
          isCorrect: false,
          feedback: "Scammers keep you on speakerphone to coach you through lying to the teller."
        }
      ]
    },
    warmStewardNotification: {
      recipient: "Daughter Sarah (Designated Contact)",
      headline: "PauseCall Guarded Dad's Bank Account",
      body: "A high-pressure 'safe account' banking scam was detected. Dad activated the cognitive pause and safely ended the call without sharing information.",
      privacyNote: "No banking passwords, account balances, or conversation audio were ever collected or stored.",
      recommendedAction: "Send Dad a quick text thanking him for exercising safe verification!"
    }
  }
];
