"use client";

/**
 * Writing Workspace — ExamGenius
 * AI-guided essay, letter & summary writing based on WAEC COEM marking scheme
 * Partitioned sections + real-time coaching + full COEM grading
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PenLine, Lightbulb, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, ArrowLeft, RefreshCw,
  Star, AlertTriangle, Info, Zap, BookOpen,
  FileText, Mail, AlignLeft, Trophy, RotateCcw,
} from "lucide-react";
import { writingAPI, type WritingType, type COEMResult, type SummaryResult } from "@/lib/api";
import AppShell from "@/components/layout/AppShell";

// ── Writing type metadata ─────────────────────────────────────────────────────
interface SectionDef {
  key: string;
  label: string;
  description: string;
  tips: string[];
  targetWords: { min: number; max: number };
  placeholder: string;
  isPassage?: boolean;  // read-only passage for summary
  isShort?: boolean;    // short format fields (address, date, etc.)
}

interface WritingDef {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  totalMarks: number;
  isSummary?: boolean;
  sections: SectionDef[];
}

const WRITING_DEFS: Record<WritingType, WritingDef> = {
  essay_argumentative: {
    label: "Argumentative Essay",
    description: "State your position and defend it with evidence. COEM: 50 marks",
    icon: PenLine,
    color: "text-emerald-400",
    totalMarks: 50,
    sections: [
      {
        key: "introduction",
        label: "Introduction",
        description: "Hook → Background → Thesis (your clear position)",
        targetWords: { min: 80, max: 120 },
        placeholder: "Start with a surprising fact, a question, or a bold statement. Give 1–2 sentences of background. End with your THESIS — your clear position on the topic...",
        tips: [
          "❌ NEVER start: 'In this essay, I will discuss...'",
          "✅ Start with impact: a fact, a question, or a bold statement",
          "📍 Background: 1–2 sentences giving context about the topic",
          "🎯 THESIS: Your last sentence should clearly state your position",
          "Example: 'Every year, thousands of students fail not because they lack intelligence, but because they lack preparation. This essay argues that...'",
        ],
      },
      {
        key: "body1",
        label: "Body Paragraph 1 — Your Strongest Point",
        description: "Topic sentence → Argument → Evidence → Transition",
        targetWords: { min: 100, max: 150 },
        placeholder: "Firstly, [state your first and strongest argument]. [Explain it]. [Give a specific example or fact]. [Transition to next paragraph]...",
        tips: [
          "🔑 FIRST SENTENCE = Topic sentence (state the main point)",
          "Start with: 'Firstly,' / 'To begin with,' / 'One key reason is...'",
          "Give a SPECIFIC example, fact, or statistic — not vague statements",
          "Explain HOW your example proves your point",
          "End with a transition: 'This shows that...' / 'Furthermore...'",
          "One paragraph = ONE idea. Don't mix two different points.",
        ],
      },
      {
        key: "body2",
        label: "Body Paragraph 2 — Your Second Point",
        description: "Topic sentence → Different argument → Evidence → Transition",
        targetWords: { min: 100, max: 150 },
        placeholder: "Furthermore, [your second argument]. [Develop it]. [Support with example]. [Link to thesis]...",
        tips: [
          "Start with: 'Furthermore,' / 'Secondly,' / 'Another key reason is...'",
          "This MUST be a DIFFERENT point from Paragraph 1",
          "Don't repeat what you said — make a new argument",
          "Link back to your thesis to keep the essay unified",
        ],
      },
      {
        key: "body3",
        label: "Body Paragraph 3 — Third Point or Counterargument",
        description: "Address the opposing view and refute it — shows critical thinking",
        targetWords: { min: 80, max: 130 },
        placeholder: "Additionally, [your third point]. OR: Some argue that [opposing view]. However, this overlooks [your refutation]...",
        tips: [
          "Start with: 'Thirdly,' / 'Additionally,' / 'It is also important...'",
          "🌟 PRO TIP: Address the OPPOSING VIEW and refute it — examiners love this!",
          "Example: 'While some argue that [X], this view fails to consider [Y]...'",
          "This shows you can think critically and see multiple angles",
        ],
      },
      {
        key: "conclusion",
        label: "Conclusion",
        description: "Restate thesis (in new words) → Summarise points → Memorable close",
        targetWords: { min: 60, max: 100 },
        placeholder: "In conclusion, [restate your thesis in DIFFERENT words]. [Briefly mention your three main points in one sentence]. [End with a powerful closing thought]...",
        tips: [
          "✅ Start with: 'In conclusion,' / 'To summarise,' / 'It is clear that...'",
          "❌ NEVER copy your introduction word-for-word",
          "❌ NEVER introduce a NEW argument here",
          "Mention ALL 3 body paragraph points briefly in one sentence",
          "End with something thought-provoking or a call to action",
          "Aim for 3–4 strong sentences",
        ],
      },
    ],
  },

  essay_narrative: {
    label: "Narrative Essay",
    description: "Tell a story from your experience. COEM: 50 marks",
    icon: BookOpen,
    color: "text-blue-400",
    totalMarks: 50,
    sections: [
      {
        key: "opening",
        label: "Opening — Set the Scene",
        description: "Start in action → Establish setting → Introduce characters",
        targetWords: { min: 80, max: 120 },
        placeholder: "Open IN the moment. Where are we? Who is here? What can you see, hear, feel? Don't say 'One day I decided to...' — start with action...",
        tips: [
          "❌ AVOID: 'One day, I woke up and decided to...'",
          "✅ Start in the ACTION: 'The moment the phone rang, I knew something was wrong.'",
          "Tell us WHERE we are and WHEN",
          "Use sensory details: what do you SEE, HEAR, SMELL, FEEL?",
          "Introduce your main character(s) naturally",
          "Create curiosity — make the reader want to know what happens next",
        ],
      },
      {
        key: "rising_action",
        label: "Rising Action — Building the Tension",
        description: "Events lead toward the main moment → Tension increases",
        targetWords: { min: 100, max: 150 },
        placeholder: "Describe the events leading up to the main moment. Use PAST TENSE. Show character emotions through actions. Use dialogue to bring it alive...",
        tips: [
          "Use PAST TENSE throughout (walked, said, thought, felt)",
          "SHOW emotions, don't just TELL: ❌ 'I was scared' ✅ 'My hands trembled and I couldn't speak'",
          "Use dialogue to make it feel real: put it in speech marks",
          "Build tension gradually — don't rush to the main event",
          "Each event should lead naturally to the next",
        ],
      },
      {
        key: "climax",
        label: "Climax — The Main Moment",
        description: "The turning point — the most dramatic or important moment",
        targetWords: { min: 80, max: 130 },
        placeholder: "This is the peak of your story — the most important or exciting moment. Describe it in vivid detail. Use short sentences for impact...",
        tips: [
          "This is the TURNING POINT — everything changes here",
          "Use SHORT sentences to create urgency: 'I ran. I tripped. I fell.'",
          "Describe every detail vividly — make the reader feel they are there",
          "Show how your character feels DURING this moment",
          "Don't rush through it — slow down and describe it carefully",
        ],
      },
      {
        key: "resolution",
        label: "Resolution — How It Ended",
        description: "Resolve the situation → Reflect on what you learned",
        targetWords: { min: 60, max: 100 },
        placeholder: "How did the situation resolve? What did you learn or how did you change? A good ending often echoes the beginning...",
        tips: [
          "Show how the conflict or problem was resolved",
          "Reflect: What did you LEARN? How did you CHANGE?",
          "Don't leave the reader hanging — give a clear, satisfying ending",
          "🌟 PRO TIP: Echo something from your opening for a strong circular ending",
          "Example: If you opened with 'The phone rang...', you could end with what the call meant to you now",
        ],
      },
    ],
  },

  essay_descriptive: {
    label: "Descriptive Essay",
    description: "Paint a picture with words. Use vivid details. COEM: 50 marks",
    icon: PenLine,
    color: "text-purple-400",
    totalMarks: 50,
    sections: [
      {
        key: "introduction",
        label: "Introduction — The Big Picture",
        description: "Introduce what you're describing and create atmosphere",
        targetWords: { min: 70, max: 110 },
        placeholder: "Set the scene powerfully. Give an overall impression before you zoom in to details...",
        tips: [
          "Start with an overall impression of what you're describing",
          "Use vivid adjectives and strong verbs",
          "Create an immediate atmosphere — what is the MOOD?",
          "Example: 'The market roared with life long before you could see it — the smell of spices and the crash of bargaining voices reaching you first.'",
        ],
      },
      {
        key: "body1",
        label: "Body — Sight & Sound",
        description: "Describe what you can see and hear",
        targetWords: { min: 100, max: 150 },
        placeholder: "What can you SEE? Colours, shapes, movements, people? What can you HEAR? Use specific, vivid language...",
        tips: [
          "Use the five senses: sight, sound, smell, taste, touch",
          "Use SPECIFIC details — not 'a big tree' but 'a mango tree whose branches spread like open arms'",
          "Use similes: 'The crowd moved like a river'",
          "Use metaphors: 'The market was a living creature'",
          "Vary your sentence lengths — short sentences for impact, longer ones for flow",
        ],
      },
      {
        key: "body2",
        label: "Body — People & Atmosphere",
        description: "Describe the people and the feeling of the place",
        targetWords: { min: 100, max: 150 },
        placeholder: "Who is there? What are they doing? What is the overall feeling or mood of the place?...",
        tips: [
          "Describe people through their actions and appearance",
          "Capture the ATMOSPHERE — does it feel chaotic? Peaceful? Exciting?",
          "Use personification where appropriate: 'The wind whispered...'",
          "Show contrasts: busy vs quiet areas, bright vs dark corners",
        ],
      },
      {
        key: "conclusion",
        label: "Conclusion — Final Impression",
        description: "Leave the reader with a lasting image or thought",
        targetWords: { min: 60, max: 90 },
        placeholder: "What final impression do you want to leave? How does this place make you feel? End with a powerful image or thought...",
        tips: [
          "Leave the reader with one powerful, lasting image",
          "Reflect on what this place/person/thing means to you",
          "Return to the atmosphere from your introduction",
          "End with a strong, memorable sentence",
        ],
      },
    ],
  },

  letter_formal: {
    label: "Formal Letter",
    description: "10-part format. Every part matters. COEM: 50 marks",
    icon: Mail,
    color: "text-amber-400",
    totalMarks: 50,
    sections: [
      {
        key: "sender_address",
        label: "Your Address [Right side]",
        description: "Your full address — top right corner",
        targetWords: { min: 3, max: 15 },
        isShort: true,
        placeholder: "14 Kairaba Avenue\nBanjul\nThe Gambia",
        tips: [
          "Write your address on the RIGHT side of the page",
          "Include: Street/House number, Town/City, Country",
          "DO NOT write your name here — only your address",
        ],
      },
      {
        key: "date",
        label: "Date",
        description: "Write the full date below your address",
        targetWords: { min: 2, max: 6 },
        isShort: true,
        placeholder: "25th April, 2026",
        tips: [
          "Write the date IN FULL: '25th April, 2026'",
          "❌ Do NOT write: '25/04/2026' — this is wrong format for formal letters",
          "Place this below your address",
        ],
      },
      {
        key: "recipient_address",
        label: "Recipient's Address [Left side]",
        description: "The address of who you're writing to",
        targetWords: { min: 3, max: 20 },
        isShort: true,
        placeholder: "The Principal\nSt. Augustine's Senior School\nKanifing, The Gambia",
        tips: [
          "Write this on the LEFT side",
          "Title + Name (or just title if name unknown)",
          "Organization name (if applicable)",
          "Their address",
          "Example: 'The Editor\nThe Daily Observer\nBanjul, The Gambia'",
        ],
      },
      {
        key: "salutation",
        label: "Salutation Critical",
        description: "The formal greeting — getting this wrong loses marks",
        targetWords: { min: 2, max: 6 },
        isShort: true,
        placeholder: "Dear Sir/Madam,",
        tips: [
          "⚠️ If you DON'T know their name: 'Dear Sir,' or 'Dear Madam,' or 'Dear Sir/Madam,'",
          "⚠️ If you DO know their name: 'Dear Mr. Johnson,' or 'Dear Mrs. Jallow,'",
          "ALWAYS end the salutation with a COMMA",
          "❌ NEVER: 'Dear Friend,' in a formal letter",
          "Remember: The salutation MUST match the subscription later",
        ],
      },
      {
        key: "subject",
        label: "Subject Line Missing = lost marks",
        description: "A brief title for your letter (RE: ...)",
        targetWords: { min: 3, max: 15 },
        isShort: true,
        placeholder: "RE: APPLICATION FOR THE POSITION OF HEAD BOY",
        tips: [
          "Start with 'RE:' followed by the subject",
          "Keep it SHORT and CLEAR",
          "Write in CAPITALS or underline it",
          "Examples:",
          "  'RE: COMPLAINT ABOUT ROAD CONDITIONS'",
          "  'RE: REQUEST FOR PERMISSION TO START A READING CLUB'",
          "  'RE: APPLICATION FOR HOLIDAY INTERNSHIP'",
        ],
      },
      {
        key: "letter_opening",
        label: "Opening Paragraph",
        description: "State the PURPOSE of your letter in the first sentence",
        targetWords: { min: 30, max: 70 },
        placeholder: "I am writing to [state your purpose clearly and directly]...",
        tips: [
          "State WHY you are writing in your FIRST sentence",
          "✅ Good: 'I am writing to apply for the position of...'",
          "✅ Good: 'I write to bring to your attention the poor condition of...'",
          "❌ BAD: 'How are you? I hope this letter finds you well...' (NEVER do this in a formal letter!)",
          "Be direct and professional from the first word",
        ],
      },
      {
        key: "letter_body",
        label: "Body Paragraphs — Main Content",
        description: "2–3 paragraphs, each with ONE main point",
        targetWords: { min: 150, max: 300 },
        placeholder: "Write your main content here. Each paragraph = one main idea. Use formal language throughout. No contractions (write 'do not' not 'don't')...",
        tips: [
          "Write 2–3 paragraphs, each making ONE clear point",
          "Use formal linking words: 'Furthermore,' / 'In addition,' / 'However,' / 'Consequently,'",
          "❌ NO contractions: write 'do not' (not 'don't'), 'I am' (not 'I'm')",
          "Be specific — use facts, reasons, and examples",
          "Remain polite even when writing a complaint",
          "Each paragraph should start on a new line",
        ],
      },
      {
        key: "letter_closing",
        label: "Closing Paragraph",
        description: "State what you expect from the reader",
        targetWords: { min: 25, max: 60 },
        placeholder: "I look forward to a favourable response at your earliest convenience...",
        tips: [
          "State what you EXPECT the reader to do (if applicable)",
          "✅ Examples:",
          "  'I look forward to a favourable response at your earliest convenience.'",
          "  'I trust that prompt action will be taken to address this matter.'",
          "  'I would be grateful if you could consider my application.'",
          "Thank the reader if appropriate",
        ],
      },
      {
        key: "subscription",
        label: "Subscription (Sign-off) Critical",
        description: "Yours faithfully OR Yours sincerely — must match salutation",
        targetWords: { min: 2, max: 4 },
        isShort: true,
        placeholder: "Yours faithfully,",
        tips: [
          "⚠️ THE GOLDEN RULE:",
          "  'Dear Sir/Madam' → 'Yours faithfully,' (you don't know their name)",
          "  'Dear Mr./Mrs. [Name]' → 'Yours sincerely,' (you know their name)",
          "⚠️ ALWAYS lowercase: 'faithfully' and 'sincerely' (not 'Faithfully')",
          "⚠️ ALWAYS end with a COMMA",
        ],
      },
      {
        key: "signature",
        label: "Signature & Full Name",
        description: "Write your full name after your signature",
        targetWords: { min: 2, max: 5 },
        isShort: true,
        placeholder: "Fatou Jallow",
        tips: [
          "Leave a small space for your actual signature",
          "Write your FULL NAME clearly below",
          "Some students add their title: '(Miss) Fatou Jallow'",
        ],
      },
    ],
  },

  letter_informal: {
    label: "Informal Letter",
    description: "Friendly letter to a friend or relative. COEM: 50 marks",
    icon: Mail,
    color: "text-pink-400",
    totalMarks: 50,
    sections: [
      {
        key: "sender_address",
        label: "Your Address",
        description: "Brief address at the top right",
        targetWords: { min: 2, max: 10 },
        isShort: true,
        placeholder: "Bakau\nThe Gambia",
        tips: ["Your town/city is usually enough for informal letters", "Top right corner"],
      },
      {
        key: "date",
        label: "Date",
        description: "The full date",
        targetWords: { min: 2, max: 6 },
        isShort: true,
        placeholder: "25th April, 2026",
        tips: ["Write the full date: '25th April, 2026'"],
      },
      {
        key: "informal_salutation",
        label: "Salutation",
        description: "Friendly greeting using their first name",
        targetWords: { min: 2, max: 5 },
        isShort: true,
        placeholder: "Dear Fatou,",
        tips: [
          "Use their first name: 'Dear Fatou,' or 'Dear Cousin,'",
          "ALWAYS end with a COMMA",
          "You can also use 'Hi [Name],' for a very casual letter",
        ],
      },
      {
        key: "informal_opening",
        label: "Opening Paragraph",
        description: "Friendly greeting + reason for writing",
        targetWords: { min: 35, max: 75 },
        placeholder: "I hope you are doing well. I am writing to tell you about [topic]...",
        tips: [
          "A brief 'How are you?' is fine for informal letters",
          "But quickly move to WHY you're writing",
          "Keep it warm and natural",
          "❌ Avoid: copying the same opener every time ('I hope this letter meets you in good health and good spirits...')",
        ],
      },
      {
        key: "informal_body",
        label: "Body Paragraphs — Main Content",
        description: "Share your news, advice, or information",
        targetWords: { min: 120, max: 280 },
        placeholder: "Write your main content here. Be personal and engaging. Share details, feelings, and experiences...",
        tips: [
          "Write in a conversational, friendly tone",
          "✅ Contractions ARE allowed: don't, can't, I'm, you're",
          "Be SPECIFIC — share real details, feelings, and experiences",
          "Organise into 2–3 clear paragraphs",
          "Avoid padding (repeating the same thing in different words)",
          "❌ AVOID: examiners can spot 'padding' — they will reduce your marks",
        ],
      },
      {
        key: "informal_closing",
        label: "Closing Paragraph",
        description: "Warm close + looking forward to a reply",
        targetWords: { min: 25, max: 60 },
        placeholder: "I hope to hear from you soon. Take care of yourself...",
        tips: [
          "Express genuine interest in their response",
          "Be warm and personal",
          "Example: 'I can't wait to hear back from you — write soon!'",
          "Mention something to look forward to if possible",
        ],
      },
      {
        key: "informal_subscription",
        label: "Sign-off",
        description: "Friendly closing phrase",
        targetWords: { min: 2, max: 5 },
        isShort: true,
        placeholder: "Your friend,",
        tips: [
          "Options: 'Yours sincerely,' / 'Best wishes,' / 'Lots of love,' / 'Your friend,' / 'Take care,'",
          "End with a COMMA",
        ],
      },
      {
        key: "signature",
        label: "Your Name",
        description: "Sign your letter with your name",
        targetWords: { min: 1, max: 4 },
        isShort: true,
        placeholder: "Amie",
        tips: ["Usually just your first name is fine for informal letters"],
      },
    ],
  },

  summary: {
    label: "Summary Writing",
    description: "Extract main ideas in your own words. 30 marks",
    icon: AlignLeft,
    color: "text-cyan-400",
    totalMarks: 30,
    isSummary: true,
    sections: [
      {
        key: "key_points",
        label: "Find the Key Points [Draft — not marked]",
        description: "List the MAIN IDEAS only — one per line, in your own words",
        targetWords: { min: 20, max: 120 },
        placeholder: "Main point 1: [in your own words]\nMain point 2: [in your own words]\nMain point 3: [in your own words]\n...",
        tips: [
          "MAIN IDEAS only — not details, not examples, not repetitions",
          "Test each point: If I remove this, does the main message change? YES = main idea. NO = skip it.",
          "Use YOUR OWN WORDS — don't copy from the passage",
          "Write ONE point per line",
          "Aim for 5–8 points for a typical 5–6 sentence summary",
        ],
      },
      {
        key: "summary_final",
        label: "Your Final Summary [GRADED]",
        description: "Write complete sentences, exactly as many as required",
        targetWords: { min: 50, max: 200 },
        placeholder: "Write your final summary here. Each sentence = one main point. Use your own words throughout. Check: are all your sentences COMPLETE? Do you have the RIGHT NUMBER of sentences?",
        tips: [
          "⚠️ Write in COMPLETE SENTENCES — not bullet points or phrases",
          "⚠️ ONE main point per sentence — don't combine two ideas",
          "⚠️ Write EXACTLY the number of sentences specified",
          "⚠️ Use YOUR OWN WORDS — direct copying = ZERO marks",
          "⚠️ NO details, examples, or illustrations — only main ideas",
          "✅ After writing, count your sentences and check they match the requirement",
          "✅ Proofread for grammar and spelling — each error = −0.5 marks",
        ],
      },
    ],
  },
};

// ── Practice prompts ───────────────────────────────────────────────────────────
const QUICK_PROMPTS: Record<WritingType, string[]> = {
  essay_argumentative: [
    "Social media does more harm than good to young people.",
    "Mobile phones should be banned in secondary schools.",
    "Every student should learn a practical skill alongside academic subjects.",
    "Reading books is more beneficial than watching television.",
    "Examinations are the best way to measure students' knowledge.",
  ],
  essay_narrative: [
    "Write about a day when everything went wrong.",
    "An experience that changed the way you see the world.",
    "A time you helped a stranger — and what happened next.",
    "The most frightening experience of my life.",
    "A day I will never forget.",
  ],
  essay_descriptive: [
    "A busy market scene in your town.",
    "Your ideal school environment.",
    "The most beautiful place you have ever visited.",
    "A person who has influenced your life greatly.",
  ],
  letter_formal: [
    "Write to your principal requesting permission to start a reading club.",
    "Write to the editor complaining about poor road conditions in your area.",
    "Apply for a holiday internship at a local company.",
    "Write to the Minister of Education suggesting improvements to schools.",
    "Report a safety hazard in your community to the local council.",
  ],
  letter_informal: [
    "Tell your friend abroad about life in your country.",
    "Congratulate your cousin on passing their WASSCE — give advice for university.",
    "Describe your school and daily life to a pen pal.",
    "Encourage a friend who is thinking of dropping out of school.",
  ],
  summary: [
    "Summarise the passage in 5 sentences in your own words.",
    "In 6 sentences, summarise the writer's views on the given topic.",
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function totalWordCount(sections: Record<string, string>): number {
  return Object.values(sections).reduce((sum, t) => sum + wordCount(t), 0);
}

function gradeColor(grade: string): string {
  const g = grade?.toUpperCase() || "";
  if (g === "A1") return "text-emerald-400";
  if (g === "B2" || g === "B3") return "text-blue-400";
  if (g === "C4" || g === "C5" || g === "C6") return "text-amber-400";
  return "text-red-400";
}

function scorePercent(score: number, max: number) {
  return max > 0 ? Math.round((score / max) * 100) : 0;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreBar({ score, max, label, color }: { score: number; max: number; label: string; color: string }) {
  const pct = scorePercent(score, max);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className={`font-bold ${color}`}>{score}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct >= 70 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TipAccordion({ tips, defaultOpen = false }: { tips: string[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[var(--em)] hover:bg-[var(--em)]/5 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" />
          Tips for this section
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <ul className="px-3 pb-3 space-y-1 border-t border-[var(--border)]">
          {tips.map((tip, i) => (
            <li key={i} className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
              {tip}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type Phase = "setup" | "writing" | "results";

export default function WritingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("setup");
  const [writingType, setWritingType] = useState<WritingType>("essay_argumentative");
  const [topic, setTopic] = useState("");
  const [passageText, setPassageText] = useState(""); // for summary
  const [sections, setSections] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [coaching, setCoaching] = useState<Record<string, string>>({});
  const [coachingLoading, setCoachingLoading] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<COEMResult | SummaryResult | null>(null);
  const [gradeError, setGradeError] = useState("");
  const coachPanelRef = useRef<HTMLDivElement>(null);

  const def = WRITING_DEFS[writingType];
  const isSummary = def.isSummary;

  // Reset sections when writing type changes
  useEffect(() => {
    setSections({});
    setCoaching({});
    setActiveSection(null);
  }, [writingType]);

  const updateSection = useCallback((key: string, value: string) => {
    setSections(prev => ({ ...prev, [key]: value }));
    // Clear old coaching when section changes
    setCoaching(prev => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev;
    });
  }, []);

  async function coachSection(sectionKey: string) {
    const text = sections[sectionKey] || "";
    if (!text.trim()) return;
    setCoachingLoading(sectionKey);
    setActiveSection(sectionKey);
    try {
      const res = await writingAPI.coach({
        writing_type: writingType,
        section_key: sectionKey,
        section_text: text,
        topic,
      });
      setCoaching(prev => ({ ...prev, [sectionKey]: res.feedback }));
      // Scroll coach panel into view on mobile
      setTimeout(() => coachPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch {
      setCoaching(prev => ({ ...prev, [sectionKey]: "Coach unavailable right now. Check your tips and continue writing." }));
    } finally {
      setCoachingLoading(null);
    }
  }

  async function gradeFullPiece() {
    const combined = def.sections.map(s => sections[s.key] || "").join("\n\n");
    if (wordCount(combined) < 50) {
      setGradeError("Please write more before grading. Fill in your sections first.");
      return;
    }
    setGrading(true);
    setGradeError("");
    try {
      const fullText = isSummary
        ? (sections["summary_final"] || "")
        : combined;
      const result = await writingAPI.grade({
        writing_type: writingType,
        sections,
        topic,
        full_text: fullText,
      });
      setGradeResult(result);
      setPhase("results");
    } catch {
      setGradeError("Could not grade right now. Check your connection and try again.");
    } finally {
      setGrading(false);
    }
  }

  function restart() {
    setSections({});
    setCoaching({});
    setGradeResult(null);
    setGradeError("");
    setActiveSection(null);
    setPhase("setup");
  }

  // ── SETUP SCREEN ────────────────────────────────────────────────────────────
  if (phase === "setup") {
    const types: { key: WritingType; emoji: string; badge: string }[] = [
      { key: "essay_argumentative", emoji: "✍️", badge: "Argumentative Essay" },
      { key: "essay_narrative",     emoji: "📖", badge: "Narrative Essay" },
      { key: "essay_descriptive",   emoji: "🖼️", badge: "Descriptive Essay" },
      { key: "letter_formal",       emoji: "📨", badge: "Formal Letter" },
      { key: "letter_informal",     emoji: "💌", badge: "Informal Letter" },
      { key: "summary",             emoji: "📝", badge: "Summary Writing" },
    ];

    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-white mb-1">Writing Workspace</h1>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Write section by section. Your AI coach gives real feedback at every step. Based on the WAEC COEM marking scheme.
          </p>

          {/* Type selector */}
          <div className="glass rounded-2xl p-5 space-y-5">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-3">
                What are you writing?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {types.map(({ key, emoji, badge }) => {
                  const d = WRITING_DEFS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setWritingType(key)}
                      className={[
                        "px-3 py-3 rounded-xl border text-sm font-medium text-left transition-all",
                        writingType === key
                          ? "bg-[var(--em-dim)] border-[var(--border-em)] text-[var(--em)]"
                          : "glass text-[var(--text-muted)] hover:text-[var(--text)] hover:border-white/15",
                      ].join(" ")}
                    >
                      <span className="text-base block mb-1">{emoji}</span>
                      <span className="text-xs font-semibold block">{badge}</span>
                      <span className="text-[10px] text-[var(--text-dim)] block mt-0.5">{d.totalMarks} marks</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic / prompt */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Topic / Question
              </label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                rows={2}
                placeholder={`Enter or paste your writing question here…\n\nOr pick one below:`}
                className="w-full bg-[#16161f] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] text-sm outline-none focus:border-[var(--em)] resize-none placeholder:text-[var(--text-dim)] transition-colors"
              />
            </div>

            {/* Quick prompts */}
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">Practice topics:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS[writingType].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setTopic(p)}
                    className={[
                      "px-3 py-1.5 rounded-lg border text-xs transition-all",
                      topic === p
                        ? "border-[var(--border-em)] bg-[var(--em-dim)] text-[var(--em)]"
                        : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-white/20",
                    ].join(" ")}
                  >
                    {p.length > 55 ? p.slice(0, 55) + "…" : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary passage input */}
            {isSummary && topic && (
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Paste the Passage to Summarise
                </label>
                <textarea
                  value={passageText}
                  onChange={e => setPassageText(e.target.value)}
                  rows={6}
                  placeholder="Paste the passage your teacher gave you here..."
                  className="w-full bg-[#16161f] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] text-sm outline-none focus:border-[var(--em)] resize-none placeholder:text-[var(--text-dim)] transition-colors leading-relaxed"
                />
              </div>
            )}

            {/* WAEC info strip */}
            <div className="flex items-start gap-2 rounded-xl bg-white/3 border border-[var(--border)] px-4 py-3">
              <Info className="w-4 h-4 text-[var(--em)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[var(--text)] font-semibold">{def.label} — WAEC Marking</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{def.description}</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!topic.trim()) return;
                setPhase("writing");
              }}
              disabled={!topic.trim()}
              className="w-full py-3 rounded-xl bg-[var(--em)] text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Start Writing →
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── RESULTS SCREEN ──────────────────────────────────────────────────────────
  if (phase === "results" && gradeResult) {
    const isSummaryResult = isSummary && "points" in gradeResult;
    const totalWc = totalWordCount(sections);

    return (
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Your Results</h1>
              <p className="text-[var(--text-muted)] text-sm">{def.label} · {totalWc} words</p>
            </div>
            <button
              onClick={restart}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--em)] border border-[var(--border)] hover:border-[var(--border-em)] px-3 py-2 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Write Again
            </button>
          </div>

          {/* Big score */}
          <div className="glass rounded-2xl p-6 flex items-center gap-6">
            <div className="shrink-0 w-24 h-24 rounded-2xl bg-[var(--em)]/15 flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold ${gradeColor(gradeResult.grade)}`}>
                {gradeResult.grade}
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-1">
                {gradeResult.total}/{gradeResult.max}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-lg">{gradeResult.total}/{gradeResult.max} marks</p>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-1">{gradeResult.overall}</p>
              {gradeResult.what_worked && (
                <p className="text-xs text-emerald-400 mt-2 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {gradeResult.what_worked}
                </p>
              )}
            </div>
          </div>

          {/* Score breakdown */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white">Score Breakdown</h2>
            {isSummaryResult ? (
              <>
                <ScoreBar score={(gradeResult as SummaryResult).points.score} max={20} label="Points (Main Ideas Captured)" color="text-emerald-400" />
                <ScoreBar score={(gradeResult as SummaryResult).language.score} max={10} label="Language (Grammar & Expression)" color="text-blue-400" />
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Feedback</p>
                  <div className="space-y-2">
                    {[
                      { label: "Points", fb: (gradeResult as SummaryResult).points.feedback },
                      { label: "Language", fb: (gradeResult as SummaryResult).language.feedback },
                    ].map(({ label, fb }) => (
                      <div key={label} className="rounded-xl bg-white/3 px-4 py-3">
                        <p className="text-xs font-semibold text-[var(--em)] mb-1">{label}</p>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{fb}</p>
                      </div>
                    ))}
                  </div>
                  {(gradeResult as SummaryResult).language.errors_found?.length > 0 && (
                    <div className="rounded-xl bg-red-500/8 border border-red-500/20 px-4 py-3">
                      <p className="text-xs font-semibold text-red-400 mb-2">Errors Found (−0.5 each)</p>
                      <ul className="space-y-1">
                        {(gradeResult as SummaryResult).language.errors_found.map((e, i) => (
                          <li key={i} className="text-xs text-red-300/80 flex items-start gap-1.5">
                            <XCircle className="w-3 h-3 shrink-0 mt-0.5" /> {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <ScoreBar score={(gradeResult as COEMResult).content.score} max={10} label="Content (Ideas & Relevance)" color="text-emerald-400" />
                <ScoreBar score={(gradeResult as COEMResult).organization.score} max={10} label="Organization (Structure & Format)" color="text-blue-400" />
                <ScoreBar score={(gradeResult as COEMResult).expression.score} max={20} label="Expression (Language & Vocabulary)" color="text-purple-400" />
                <ScoreBar score={(gradeResult as COEMResult).mechanics.score} max={10} label="Mechanical Accuracy (Grammar & Spelling)" color="text-amber-400" />
                <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Detailed Feedback</p>
                  {[
                    { label: "Content", fb: (gradeResult as COEMResult).content.feedback, color: "text-emerald-400" },
                    { label: "Organization", fb: (gradeResult as COEMResult).organization.feedback, color: "text-blue-400" },
                    { label: "Expression", fb: (gradeResult as COEMResult).expression.feedback, color: "text-purple-400" },
                    { label: "Mechanical Accuracy", fb: (gradeResult as COEMResult).mechanics.feedback, color: "text-amber-400" },
                  ].map(({ label, fb, color }) => (
                    <div key={label} className="rounded-xl bg-white/3 px-4 py-3">
                      <p className={`text-xs font-semibold mb-1 ${color}`}>{label}</p>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed">{fb}</p>
                    </div>
                  ))}
                  {(gradeResult as COEMResult).mechanics.errors_found?.length > 0 && (
                    <div className="rounded-xl bg-red-500/8 border border-red-500/20 px-4 py-3">
                      <p className="text-xs font-semibold text-red-400 mb-2">Errors Spotted (−0.5 each)</p>
                      <ul className="space-y-1">
                        {(gradeResult as COEMResult).mechanics.errors_found.map((e, i) => (
                          <li key={i} className="text-xs text-red-300/80 flex items-start gap-1.5">
                            <XCircle className="w-3 h-3 shrink-0 mt-0.5" /> {e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Top improvements */}
          {gradeResult.top_improvements?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Top 3 Improvements for Next Time
              </h2>
              <div className="space-y-2">
                {gradeResult.top_improvements.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-amber-500/8 border border-amber-500/15 px-4 py-3">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-[var(--text)] leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button
              onClick={() => setPhase("writing")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Revise My Writing
            </button>
            <button
              onClick={restart}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--em)] text-black text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" /> Write Again
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── WRITING WORKSPACE ───────────────────────────────────────────────────────
  const totalWc = totalWordCount(sections);
  const filledSections = def.sections.filter(s => !s.isPassage && wordCount(sections[s.key] || "") >= (s.targetWords.min || 5)).length;
  const totalSections  = def.sections.filter(s => !s.isPassage).length;

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-[var(--border)]"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhase("setup")}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-red-400 border border-[var(--border)] hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit
          </button>
          <div>
            <p className="text-sm font-semibold text-white">{def.label}</p>
            <p className="text-xs text-[var(--text-dim)] truncate max-w-[200px] sm:max-w-none">{topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[var(--em)] tabular-nums">{totalWc} words</p>
            <p className="text-[10px] text-[var(--text-dim)]">{filledSections}/{totalSections} sections</p>
          </div>
          <button
            onClick={gradeFullPiece}
            disabled={grading || totalWc < 50}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--em)] text-black text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {grading ? (
              <><Zap className="w-3.5 h-3.5 animate-pulse" /> Grading…</>
            ) : (
              <><Trophy className="w-3.5 h-3.5" /> Get Grade</>
            )}
          </button>
        </div>
      </div>

      {gradeError && (
        <div className="mx-4 mt-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400">
          {gradeError}
        </div>
      )}

      {/* Layout: sections left, coach right */}
      <div className="flex gap-0 lg:gap-6 px-0 lg:px-6 py-4 max-w-6xl mx-auto">

        {/* ── Left: Writing sections ── */}
        <div className="flex-1 min-w-0 space-y-4 px-4 lg:px-0">

          {/* Summary: show passage if provided */}
          {isSummary && passageText && (
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[var(--em)]" />
                <h3 className="text-sm font-bold text-white">📖 Read This Passage</h3>
              </div>
              <div className="rounded-xl bg-white/3 border border-[var(--border)] px-4 py-4">
                <p className="text-sm text-[var(--text)] leading-[1.9] whitespace-pre-wrap">{passageText}</p>
              </div>
              <TipAccordion
                tips={[
                  "Read the passage TWICE before writing anything",
                  "First read: understand the general idea",
                  "Second read: identify the MAIN POINTS (not details, not examples)",
                  "Ask yourself: 'What is the author's main message in each paragraph?'",
                ]}
              />
            </div>
          )}

          {/* Summary instruction */}
          {isSummary && (
            <div className="flex items-start gap-2 glass rounded-xl px-4 py-3">
              <Info className="w-4 h-4 text-[var(--em)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[var(--em)]">Task</p>
                <p className="text-xs text-[var(--text-muted)]">{topic}</p>
              </div>
            </div>
          )}

          {/* Each section */}
          {def.sections.filter(s => !s.isPassage).map((section, idx) => {
            const text = sections[section.key] || "";
            const wc   = wordCount(text);
            const { min, max } = section.targetWords;
            const isShort    = section.isShort;
            const isFilled   = wc >= (min || 3);
            const isOver     = max > 0 && wc > max;
            const sectionCoaching = coaching[section.key];
            const isLoadingThis   = coachingLoading === section.key;
            const isActive        = activeSection === section.key;

            return (
              <div
                key={section.key}
                className={[
                  "rounded-2xl border transition-all",
                  isActive
                    ? "border-[var(--border-em)] bg-[var(--em)]/3"
                    : "border-[var(--border)] bg-[var(--bg-card)]",
                ].join(" ")}
              >
                {/* Section header */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        {isFilled ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-[var(--em)] text-[var(--em)] text-[10px] font-bold flex items-center justify-center shrink-0 opacity-60">
                            {idx + 1}
                          </span>
                        )}
                        <h3 className="text-sm font-bold text-white">{section.label}</h3>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 ml-6">{section.description}</p>
                    </div>
                    {min > 0 && (
                      <span className={[
                        "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        isFilled
                          ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/8"
                          : "text-[var(--text-dim)] border-[var(--border)]",
                      ].join(" ")}>
                        {min}–{max}w
                      </span>
                    )}
                  </div>
                </div>

                {/* Textarea */}
                <div className="px-5 pb-3">
                  <textarea
                    value={text}
                    onChange={e => updateSection(section.key, e.target.value)}
                    onFocus={() => setActiveSection(section.key)}
                    rows={isShort ? 3 : section.key === "letter_body" || section.key === "informal_body" || section.key === "summary_final" ? 10 : 6}
                    placeholder={section.placeholder}
                    className={[
                      "w-full bg-[#0d0d16] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] text-sm leading-[1.9] outline-none resize-none placeholder:text-[var(--text-dim)] transition-colors font-[inherit]",
                      isActive ? "focus:border-[var(--em)]" : "focus:border-[var(--border-em)]",
                    ].join(" ")}
                  />

                  {/* Word count + Coach button row */}
                  <div className="flex items-center justify-between mt-2">
                    <span className={[
                      "text-xs tabular-nums",
                      isOver  ? "text-amber-400" :
                      isFilled ? "text-emerald-400" : "text-[var(--text-dim)]",
                    ].join(" ")}>
                      {wc} word{wc !== 1 ? "s" : ""}
                      {min > 0 && !isFilled && ` · ${min - wc} more to go`}
                      {isFilled && !isOver && <> · <CheckCircle2 className="w-3 h-3 inline ml-0.5 text-emerald-400" /></>}
                      {isOver && ` · ${wc - max} over target`}
                    </span>
                    {text.trim().length > 30 && (
                      <button
                        onClick={() => coachSection(section.key)}
                        disabled={isLoadingThis}
                        className="flex items-center gap-1.5 text-xs text-[var(--em)] hover:opacity-80 transition-opacity disabled:opacity-50 border border-[var(--border-em)]/40 hover:border-[var(--border-em)] px-3 py-1.5 rounded-lg"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        {isLoadingThis ? "Coaching…" : "Coach this"}
                      </button>
                    )}
                  </div>

                  {/* Inline coaching feedback */}
                  {sectionCoaching && (
                    <div className="mt-3 rounded-xl bg-[var(--em)]/6 border border-[var(--em)]/20 px-4 py-3 space-y-1.5">
                      <p className="text-[10px] font-bold text-[var(--em)] uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3" /> AI Coach
                      </p>
                      <p className="text-xs text-[var(--text)] leading-relaxed whitespace-pre-wrap">{sectionCoaching}</p>
                    </div>
                  )}

                  {/* Tips accordion */}
                  <div className="mt-2">
                    <TipAccordion tips={section.tips} defaultOpen={idx === 0} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Bottom grade button */}
          <div className="pb-8 pt-2">
            <button
              onClick={gradeFullPiece}
              disabled={grading || totalWc < 50}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[var(--em)] text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {grading ? (
                <><Zap className="w-4 h-4 animate-pulse" /> AI is grading your full piece…</>
              ) : (
                <><Trophy className="w-4 h-4" /> Grade My Full Piece (COEM)</>
              )}
            </button>
            {totalWc < 300 && (
              <p className="text-center text-xs text-amber-400 mt-2">
                ⚠️ WAEC requires at least 450 words for essays. You have {totalWc} words.
              </p>
            )}
          </div>
        </div>

        {/* ── Right: Sticky coach panel (desktop) ── */}
        <div ref={coachPanelRef} className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 space-y-4">

            {/* Progress card */}
            <div className="glass rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">Progress</h3>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">Sections filled</span>
                  <span className="font-bold text-[var(--em)]">{filledSections}/{totalSections}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[var(--em)] transition-all duration-500"
                    style={{ width: `${totalSections > 0 ? (filledSections / totalSections) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Total words</span>
                <span className={`font-bold tabular-nums ${totalWc >= 450 ? "text-emerald-400" : totalWc >= 200 ? "text-amber-400" : "text-[var(--text-muted)]"}`}>
                  {totalWc}{!isSummary && " / 450 min"}
                </span>
              </div>
            </div>

            {/* Marking scheme reminder */}
            <div className="glass rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                {isSummary ? "Summary Marking" : "COEM Scheme"}
              </h3>
              {isSummary ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Points (main ideas)</span>
                    <span className="font-bold text-white">20</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Language & grammar</span>
                    <span className="font-bold text-white">10</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-[var(--border)] pt-2">
                    <span className="font-semibold text-[var(--text)]">Total</span>
                    <span className="font-bold text-[var(--em)]">30</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { label: "Content", marks: 10, tip: "Relevant ideas, depth, originality" },
                    { label: "Organization", marks: 10, tip: "Structure, paragraphing, format" },
                    { label: "Expression", marks: 20, tip: "Vocabulary, sentences, flow" },
                    { label: "Mechanics", marks: 10, tip: "Grammar, spelling, punctuation" },
                  ].map(({ label, marks, tip }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs">
                        <span className="text-[var(--text-muted)]">{label}</span>
                        <span className="font-bold text-white">{marks}</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-dim)]">{tip}</p>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs border-t border-[var(--border)] pt-2">
                    <span className="font-semibold text-[var(--text)]">Total</span>
                    <span className="font-bold text-[var(--em)]">50</span>
                  </div>
                </div>
              )}
            </div>

            {/* Latest coaching */}
            {activeSection && coaching[activeSection] && (
              <div className="glass rounded-2xl p-4 space-y-2">
                <h3 className="text-xs font-bold text-[var(--em)] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  AI Coach — {def.sections.find(s => s.key === activeSection)?.label}
                </h3>
                <p className="text-xs text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                  {coaching[activeSection]}
                </p>
              </div>
            )}

            {/* Common mistakes */}
            <div className="glass rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Common Mistakes
              </h3>
              <ul className="space-y-1.5">
                {(writingType === "letter_formal" ? [
                  "Wrong subscription (faithfully vs sincerely)",
                  "Missing subject line",
                  "No salutation comma",
                  "Casual opener ('How are you?')",
                  "Using contractions (don't → do not)",
                ] : writingType === "summary" ? [
                  "Copying word-for-word (= zero)",
                  "Including examples/details",
                  "Writing phrases not sentences",
                  "Two ideas in one sentence",
                  "Wrong number of sentences",
                ] : [
                  "Starting with 'In this essay...'",
                  "No clear thesis statement",
                  "Body paragraphs without topic sentences",
                  "Conclusion repeating intro exactly",
                  "Grammar/spelling errors (−0.5 each)",
                ]).map((m, i) => (
                  <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-1.5">
                    <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key rule for the day */}
            <div className="glass rounded-2xl p-4 border border-[var(--border-em)]/20">
              <p className="text-[10px] font-bold text-[var(--em)] uppercase tracking-wider mb-1">
                Key Rule to Remember
              </p>
              <p className="text-xs text-[var(--text)] leading-relaxed">
                {writingType === "letter_formal"
                  ? "'Dear Sir/Madam' → 'Yours faithfully' · 'Dear Mr./Mrs. [Name]' → 'Yours sincerely'"
                  : writingType === "summary"
                  ? "One main idea per sentence. No copying. No details. Complete sentences only."
                  : "One paragraph = one idea. Start each body paragraph with a topic sentence."}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
