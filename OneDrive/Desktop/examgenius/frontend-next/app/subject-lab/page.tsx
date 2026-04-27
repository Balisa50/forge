"use client";

/**
 * Subject Answer Lab — ExamGenius
 * AI-guided structured answering for WAEC subjects
 * Physics · Chemistry · Biology · Maths · Economics · Accounting · Government
 * Based on official WAEC marking schemes — coaching per section
 */

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Lightbulb, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Trophy, Zap, RotateCcw,
  AlertTriangle, Info, RefreshCw, FlaskConical,
  Calculator, BookOpen, TrendingUp, Landmark, Scale,
  Globe, Leaf, Monitor, Heart, Utensils, ShoppingCart,
} from "lucide-react";
import {
  subjectLabAPI, type SubjectAnswerType, type SubjectGradeResult,
} from "@/lib/api";
import AppShell from "@/components/layout/AppShell";

// ── Subject + type catalogue (client-side, mirrors backend) ──────────────────
interface SectionDef {
  key: string;
  label: string;
  criteria: string;
  tip: string;
  rows?: number;   // textarea height hint
}

interface TypeDef {
  subject: string;
  subjectKey: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  accent: string;
  markingNote: string;
  sections: SectionDef[];
}

const TYPE_DEFS: Record<SubjectAnswerType, TypeDef> = {
  physics_calculation: {
    subject: "Physics", subjectKey: "physics",
    label: "Calculation Question",
    description: "Formula → Values → Substitution → Working → Answer + Units",
    icon: Calculator, color: "text-blue-400", accent: "border-blue-400/30 bg-blue-400/5",
    markingNote: "Method marks are awarded for each correct step — even if your final answer is wrong, showing all steps saves marks. Missing units = −1 mark.",
    sections: [
      { key: "formula",       label: "State the Formula",          rows: 2,  criteria: "correct formula written in symbols (e.g. F = ma)", tip: "Write the formula FIRST — before substituting anything. This earns a method mark even if your answer is wrong." },
      { key: "variables",     label: "List Your Given Values",      rows: 3,  criteria: "all values listed with correct symbols and units", tip: "List every value the question gives you. Write: symbol = value unit. e.g. m = 5 kg, a = 10 m/s²." },
      { key: "substitution",  label: "Substitute Into Formula",     rows: 2,  criteria: "values correctly substituted into formula with units", tip: "Replace the letters in the formula with numbers. Show the units. e.g. F = 5 × 10. This step earns marks." },
      { key: "working",       label: "Show All Working Steps",      rows: 4,  criteria: "every calculation step shown; no skipped steps", tip: "Show EVERY step. Never jump from substitution to the final answer. Each visible step = marks." },
      { key: "answer",        label: "Final Answer + Units",        rows: 2,  criteria: "correct number with correct SI unit; correct significant figures", tip: "⚠️ ALWAYS state the unit. 'F = 50' is wrong. 'F = 50 N' is correct. Missing unit = −1 mark." },
    ],
  },

  physics_theory: {
    subject: "Physics", subjectKey: "physics",
    label: "Theory / Explain Question",
    description: "Define → Explain mechanism → Application / Example",
    icon: BookOpen, color: "text-blue-400", accent: "border-blue-400/30 bg-blue-400/5",
    markingNote: "Use precise scientific language. Vague answers like 'it affects speed' earn zero. Be specific about causes and effects.",
    sections: [
      { key: "definition",   label: "Define the Term / Law",        rows: 3,  criteria: "precise scientific definition using correct physics terminology", tip: "Define the KEY TERM first — in ONE or TWO precise sentences. Include quantity, relationship, and conditions." },
      { key: "explanation",  label: "Explain the Concept",          rows: 5,  criteria: "clear explanation of mechanism, causes and effects; relevant equation stated", tip: "Explain HOW it works step by step. Include the relevant formula if there is one. Use words like 'directly proportional', 'inversely proportional'." },
      { key: "example",      label: "Real-World Application",       rows: 3,  criteria: "specific real-world application that demonstrates understanding", tip: "Give ONE specific application. e.g. 'Total internal reflection is used in optical fibres to transmit data as light signals.' Vague examples earn no marks." },
      { key: "diagram",      label: "Diagram (if required)",        rows: 4,  criteria: "labeled diagram with correct parts, ruled label lines, correct structure", tip: "Only draw if asked OR if it greatly helps. Label EVERY part. Use lines (not arrows) to labels. A well-labeled diagram = 2–3 marks." },
    ],
  },

  chemistry_equation: {
    subject: "Chemistry", subjectKey: "chemistry",
    label: "Chemical Equation",
    description: "Word eq → Formulae → Balance → State symbols → Conditions",
    icon: FlaskConical, color: "text-green-400", accent: "border-green-400/30 bg-green-400/5",
    markingNote: "WAEC marks every element: correct formulae, balanced equation, state symbols (s)(l)(g)(aq), and conditions above the arrow. Missing state symbols costs marks per compound.",
    sections: [
      { key: "word_equation",  label: "Word Equation",               rows: 2,  criteria: "correct reactants → correct products in words", tip: "Write it in plain words: e.g. 'Magnesium + Oxygen → Magnesium Oxide'. This helps you think before writing formulae." },
      { key: "formulae",       label: "Chemical Formulae (Unbalanced)", rows: 2, criteria: "correct chemical formulae for all reactants and products", tip: "Replace each word with the correct formula. Know your diatomic molecules: H₂, O₂, N₂, Cl₂, Br₂. Know your polyatomic ions: SO₄²⁻, NO₃⁻, CO₃²⁻." },
      { key: "balanced",       label: "Balanced Equation",         rows: 2,  criteria: "same number of each type of atom on both sides; correct coefficients", tip: "Count atoms on BOTH sides. Add coefficients (big numbers in front) until balanced. NEVER change subscripts inside a formula — only add coefficients." },
      { key: "state_symbols",  label: "Add State Symbols Critical", rows: 2, criteria: "correct (s)(l)(g)(aq) after EVERY compound", tip: "⚠️ Add (s)(l)(g)(aq) after EVERY compound. (s)=solid, (l)=liquid, (g)=gas, (aq)=dissolved in water. e.g. 2Mg(s) + O₂(g) → 2MgO(s)" },
      { key: "conditions",     label: "Conditions Above Arrow",       rows: 2,  criteria: "relevant conditions: Δ for heat, catalyst name, pressure, light", tip: "Write conditions ABOVE the arrow: Δ (heat), catalyst name, 'high pressure', 'UV light'. If none needed, leave the arrow plain." },
    ],
  },

  chemistry_practical: {
    subject: "Chemistry", subjectKey: "chemistry",
    label: "Practical / Qualitative Analysis",
    description: "Test → Observation → Inference → Conclusion",
    icon: FlaskConical, color: "text-green-400", accent: "border-green-400/30 bg-green-400/5",
    markingNote: "Every step is marked separately. Use precise chemical language — 'white precipitate', not 'white stuff'. 'Effervescence', not 'bubbling'. Each imprecise word loses marks.",
    sections: [
      { key: "test",        label: "Test Performed",   rows: 2,  criteria: "specific reagent and procedure stated clearly", tip: "State WHAT you did: 'Added 3 drops of AgNO₃ solution to the sample.' Never say 'added a chemical' — always name it." },
      { key: "observation", label: "Observation",      rows: 3,  criteria: "precise description of what was seen/smelled using correct chemical language", tip: "Use proper words: 'white precipitate formed', 'colourless gas evolved', 'solution turned blue', 'effervescence observed'. Not: 'stuff appeared', 'bubbles'." },
      { key: "inference",   label: "Inference",        rows: 2,  criteria: "correct chemical conclusion drawn: what ion or compound is present or absent", tip: "State WHAT the observation proves. e.g. 'White precipitate with AgNO₃ → Cl⁻ ions present.' If negative: 'No precipitate → Cl⁻ ions absent.'" },
      { key: "conclusion",  label: "Overall Conclusion", rows: 2, criteria: "identity of substance based on all tests combined; supported by observations", tip: "State the final identity based on ALL tests: 'From the above tests, the substance is sodium chloride (NaCl).' Must be consistent with your observations." },
    ],
  },

  biology_explanation: {
    subject: "Biology", subjectKey: "biology",
    label: "Explanation Question",
    description: "Define → Mechanism → Example → Significance",
    icon: BookOpen, color: "text-emerald-400", accent: "border-emerald-400/30 bg-emerald-400/5",
    markingNote: "Use scientific names, not common names. 'Tomato' = wrong. 'Lycopersicum esculentum' = correct. Vague answers earn zero — be specific about every step of the mechanism.",
    sections: [
      { key: "definition",   label: "Define the Term",              rows: 2,  criteria: "accurate scientific definition using correct biological terminology", tip: "Define the term PRECISELY in biological language. Include the organism type, process, inputs, outputs. Every specific word is a potential mark." },
      { key: "mechanism",    label: "Explain the Mechanism (Steps)", rows: 6,  criteria: "step-by-step explanation in correct sequence; correct scientific terms throughout", tip: "⚠️ Use SCIENTIFIC NAMES only. No 'food pipe' — say 'oesophagus'. Explain the steps IN ORDER. Use: 'firstly', 'then', 'as a result', 'consequently'." },
      { key: "example",      label: "Specific Example",             rows: 2,  criteria: "relevant specific example with correct scientific name", tip: "Give a SPECIFIC example with the correct scientific name. e.g. 'The Venus flytrap (Dionaea muscipula) shows thigmonasty — closing when touched.' Vague: zero marks." },
      { key: "significance", label: "Significance / Importance",    rows: 2,  criteria: "explains the biological importance of the process to the organism or ecosystem", tip: "Explain WHY it matters. 'This is significant because...' Shows deeper understanding and earns extra marks." },
    ],
  },

  biology_comparison: {
    subject: "Biology", subjectKey: "biology",
    label: "Comparison Question Table Required",
    description: "Table header → Points of comparison — NOT tabulating = −1 mark automatic",
    icon: BookOpen, color: "text-emerald-400", accent: "border-emerald-400/30 bg-emerald-400/5",
    markingNote: "⚠️ WAEC Biology: Comparison MUST be in table format. Failure to tabulate = −1 mark automatic deduction. Use scientific names in headers. Each correct row = 1 mark.",
    sections: [
      { key: "table_header", label: "Table Header (Feature | A | B)", rows: 3,  criteria: "table with correct column headers: Feature | [Name A] | [Name B] with scientific names", tip: "⚠️ MUST draw a table. THREE columns: Feature | [Scientific Name A] | [Scientific Name B]. No table = −1 mark immediately." },
      { key: "points",       label: "Points of Comparison (min 5)",   rows: 10, criteria: "at least 5 correct biological differences or similarities in table rows", tip: "Each ROW = one feature. Features to compare: cell wall, nucleus, mode of nutrition, reproduction, locomotion, respiration, size, habitat. Use correct biology terms in each cell." },
      { key: "conclusion",   label: "Conclusion (if asked)",           rows: 2,  criteria: "clear biological conclusion about relationship or classification of the two organisms", tip: "Only write if the question asks for it. State the main biological relationship clearly in 1–2 sentences." },
    ],
  },

  mathematics_calculation: {
    subject: "Mathematics", subjectKey: "maths",
    label: "Calculation / Problem",
    description: "Given → Required → Formula → Substitution → Working → Answer + Units",
    icon: Calculator, color: "text-purple-400", accent: "border-purple-400/30 bg-purple-400/5",
    markingNote: "WAEC Maths uses Method (M) marks + Accuracy (A) marks. Even if your answer is wrong, showing correct steps earns method marks. Missing units = −1. Premature rounding = −1. Wrong sig figs = −1.",
    sections: [
      { key: "given",        label: "List What Is Given",            rows: 3,  criteria: "all given values listed with correct symbols and units", tip: "Write 'Given:' and list every value from the question with its symbol and unit. Shows you understood what you are working with." },
      { key: "required",     label: "State What Is Required (Find:)", rows: 1,  criteria: "clearly states what needs to be found", tip: "Write 'Find: [what the question asks for]'. e.g. 'Find: Volume V'. Keeps you focused and shows the examiner you read the question." },
      { key: "formula",      label: "State the Formula",             rows: 2,  criteria: "correct formula in symbolic form before substituting values", tip: "⚠️ State the formula FIRST. e.g. 'V = πr²h'. No formula = no method mark. This is often the most important step." },
      { key: "substitution", label: "Substitute Values",             rows: 2,  criteria: "all values correctly substituted into the formula, clearly shown", tip: "Replace every letter with its value. Show this step — it earns marks even if your arithmetic later is wrong." },
      { key: "working",      label: "Show All Working Steps",        rows: 5,  criteria: "every arithmetic step shown; correct intermediate values; no premature rounding", tip: "⚠️ Show EVERY step. Never skip. Do NOT round until the final answer — premature rounding = −1 mark." },
      { key: "answer",       label: "Final Answer + Units + Sig Figs", rows: 2, criteria: "correct answer; correct unit; correct significant figures or decimal places", tip: "⚠️ ALWAYS write the unit. Check the sig figs the question requires. State your answer clearly on a new line." },
    ],
  },

  mathematics_proof: {
    subject: "Mathematics", subjectKey: "maths",
    label: "Proof / 'Show That' Question",
    description: "Setup LHS/RHS → Logical steps → Conclude LHS = RHS",
    icon: Calculator, color: "text-purple-400", accent: "border-purple-400/30 bg-purple-400/5",
    markingNote: "Each logical step earns marks. Start from ONE side only (usually the more complex). Never assume what you are trying to prove. End with a clear 'LHS = RHS ✓' statement.",
    sections: [
      { key: "setup",      label: "Set Up LHS and RHS",         rows: 2,  criteria: "identifies LHS and RHS correctly; states which side to work from", tip: "Write 'LHS = ...' and 'RHS = ...' to show you understand the structure. Always start from the MORE COMPLICATED side." },
      { key: "steps",      label: "Logical Working Steps",      rows: 8,  criteria: "each step follows logically from previous; correct algebraic manipulation; identities stated", tip: "Show EVERY algebraic step. Write which identity/rule you are using (e.g. 'using sin²θ + cos²θ = 1'). Never skip steps — each visible step = marks." },
      { key: "conclusion", label: "Conclusion: LHS = RHS",   rows: 1,  criteria: "clear final statement confirming the proof is complete", tip: "End with: '∴ LHS = RHS (proved)' or 'Hence shown ✓'. Without this final statement you may lose the conclusion mark even if all working is correct." },
    ],
  },

  economics_theory: {
    subject: "Economics", subjectKey: "economics",
    label: "Theory / Essay Question",
    description: "Define → Explain with points → Labeled diagram → Real-world example",
    icon: TrendingUp, color: "text-amber-400", accent: "border-amber-400/30 bg-amber-400/5",
    markingNote: "Diagrams are worth up to 8 marks. Missing a diagram where one is expected = major mark loss. Define every key term. Use real examples from West Africa or your country.",
    sections: [
      { key: "definition",  label: "Define the Key Term(s)",        rows: 3,  criteria: "precise economic definition of the main concept in the question", tip: "ALWAYS define the key term FIRST. Include: what it is, the relationship (directly/inversely proportional), and the condition (ceteris paribus / all other things equal)." },
      { key: "explanation", label: "Explain with Numbered Points",   rows: 8,  criteria: "at least 4 clear economic points, each in own paragraph with explanation", tip: "Number your points: 1. 2. 3. Each point needs: TOPIC SENTENCE (state the point) + EXPLANATION (why/how). Don't list headings without explaining them." },
      { key: "diagram",     label: "Draw & Explain Diagram Critical", rows: 8, criteria: "correct diagram type; labeled axes (Q, P); curves/lines labeled; shifts shown with arrows; diagram explained in text below", tip: "⚠️ Draw a diagram for ANY topic involving demand, supply, curves, or relationships. Label EVERYTHING: axes (Q and P), curves (D, S, D₁), equilibrium point. Then EXPLAIN the diagram in words below it." },
      { key: "real_world",  label: "Real-World Example",             rows: 3,  criteria: "specific example from The Gambia, West Africa, or globally that illustrates the concept", tip: "Be SPECIFIC: 'In The Gambia, when fuel prices rose in 2023, the cost of transport increased, reducing consumer spending on other goods.' Vague examples earn nothing." },
      { key: "conclusion",  label: "Conclusion",                     rows: 2,  criteria: "brief conclusion linking points back to the question; policy implication if relevant", tip: "2–3 sentences. Answer the question directly. Add a policy implication: 'Governments can use... to address this.' Don't introduce new arguments." },
    ],
  },

  accounting_ledger: {
    subject: "Financial Accounting", subjectKey: "accounting",
    label: "Ledger Account (T-Account)",
    description: "Account title → DR entries (left) → CR entries (right) → Balance",
    icon: Landmark, color: "text-cyan-400", accent: "border-cyan-400/30 bg-cyan-400/5",
    markingNote: "T-account format is rigid. Wrong side (DR vs CR) = zero for that entry. Include all columns: Date | Particulars | Folio | Amount. Balance must be shown correctly as 'Balance c/d' and 'Balance b/d'.",
    sections: [
      { key: "account_title", label: "Account Title",                rows: 1,  criteria: "correct account name written clearly at top; correct account type identified", tip: "Write the account name clearly and UNDERLINE it. Know your account types: Assets (DR balance), Liabilities (CR balance), Income (CR), Expenses (DR), Capital (CR), Drawings (DR)." },
      { key: "debit_side",    label: "Debit Side (LEFT — DR entries)", rows: 6, criteria: "correct debit entries: Date | Particulars | Folio | Amount on left side", tip: "DR side = LEFT. Items that DEBIT this account: money/assets coming IN, expenses increasing, drawings. Format each row: [Date] | [Where from] | [Folio] | [Amount]." },
      { key: "credit_side",   label: "Credit Side (RIGHT — CR entries)", rows: 6, criteria: "correct credit entries: Date | Particulars | Folio | Amount on right side", tip: "CR side = RIGHT. Items that CREDIT this account: money going OUT, liabilities increasing, income received, capital. Remember: every debit somewhere = credit somewhere else (double entry)." },
      { key: "balance",       label: "Balance the Account",           rows: 4,  criteria: "totals of both sides calculated; Balance c/d on larger side; totals equal; Balance b/d below", tip: "Steps: 1) Add both sides. 2) Write 'Balance c/d' on the BIGGER side for the difference. 3) Both sides now total the same. 4) Below the totals, write 'Balance b/d' on the OPPOSITE side." },
    ],
  },

  accounting_trial_balance: {
    subject: "Financial Accounting", subjectKey: "accounting",
    label: "Trial Balance",
    description: "Header → List DR accounts (left) → List CR accounts (right) → Totals must equal",
    icon: Landmark, color: "text-cyan-400", accent: "border-cyan-400/30 bg-cyan-400/5",
    markingNote: "DR total must equal CR total. Wrong classification (putting an asset in CR) = lose that mark. Missing accounts = lose marks. Format: Account | DR | CR.",
    sections: [
      { key: "header",       label: "Trial Balance Header",          rows: 2,  criteria: "business name; 'Trial Balance as at [date]'; column headers: Account | DR | CR", tip: "Write: [Business Name]\\nTrial Balance as at [Date]. Then column headers: Account | DR (D/£) | CR (D/£). Correct header is worth marks." },
      { key: "dr_accounts",  label: "DR Column — Debit Balances",    rows: 8,  criteria: "all debit-balance accounts listed with correct amounts in DR column", tip: "DR balances: ALL assets (Cash, Bank, Debtors, Stock, Equipment, Premises), ALL expenses (Purchases, Wages, Rent paid), Drawings. List each with its correct balance amount." },
      { key: "cr_accounts",  label: "CR Column — Credit Balances",   rows: 6,  criteria: "all credit-balance accounts listed with correct amounts in CR column", tip: "CR balances: ALL liabilities (Creditors, Loans, Overdraft), Capital, ALL income (Sales, Rent received, Discount received). List each with its correct balance." },
      { key: "totals",       label: "Totals — Must Equal",           rows: 2,  criteria: "both columns totalled correctly; DR total = CR total", tip: "⚠️ Add both columns. They MUST be equal. If not: check arithmetic, check wrong side classifications, check missing accounts. State the total clearly at the bottom of each column." },
    ],
  },

  government_essay: {
    subject: "Government", subjectKey: "government",
    label: "Essay / Theory Question",
    description: "Define → Numbered points → West African examples → Conclusion",
    icon: Scale, color: "text-orange-400", accent: "border-orange-400/30 bg-orange-400/5",
    markingNote: "Marks for: correct definition, each numbered point explained (not just listed), relevant West African/Gambian examples, and a clear conclusion. Simply listing headings earns very few marks.",
    sections: [
      { key: "introduction", label: "Introduction + Definition",     rows: 3,  criteria: "defines the key term in the question clearly and correctly; brief intro", tip: "Define the KEY TERM from the question FIRST. e.g. 'Federalism is a system of government in which powers are constitutionally divided between a central government and component state governments.' This is your first mark." },
      { key: "main_points",  label: "Main Points (Numbered 1, 2, 3…)", rows: 12, criteria: "at least 5 correct points; each numbered; each explained in 2–3 sentences not just listed", tip: "Number every point: 1. 2. 3. Each point needs:\n• TOPIC SENTENCE: state the point clearly\n• EXPLANATION: explain why/how in 2 sentences\n\nDon't just list headings — examiners mark the EXPLANATION, not the heading." },
      { key: "examples",     label: "West African / Gambian Examples", rows: 4, criteria: "specific examples from The Gambia or West Africa that illustrate the points", tip: "Be SPECIFIC: 'In The Gambia, the 1997 Constitution established...', 'ECOWAS was formed in 1975 as an example of...', 'Nigeria under the 1960 Constitution...'. Name dates, institutions, countries." },
      { key: "conclusion",   label: "Conclusion",                     rows: 2,  criteria: "clear conclusion answering the question; no new arguments; summary of key points", tip: "2–3 sentences. Directly answer the question. e.g. 'In conclusion, democracy remains the most effective system of government because...' No new points here." },
    ],
  },

  // ── FURTHER MATHEMATICS ───────────────────────────────────────────────────
  further_maths_calculation: {
    subject: "Further Mathematics", subjectKey: "further_maths",
    label: "Calculation / Proof",
    description: "Given → Theorem/Formula → All working steps → Answer",
    icon: Calculator, color: "text-purple-300", accent: "border-purple-300/30 bg-purple-300/5",
    markingNote: "State the theorem or formula BEFORE applying it. Show every algebraic step — no skipping. Use correct notation (matrix brackets, Σ, lim, vectors). Method marks are awarded per step even if final answer is wrong.",
    sections: [
      { key: "given",    label: "State What Is Given",           rows: 3, criteria: "all given values, conditions, or constraints listed clearly", tip: "Write 'Given:' and list everything the question provides — values, matrices, ranges, constraints. This shows you understood the question before you began." },
      { key: "theorem",  label: "State the Theorem / Formula",   rows: 3, criteria: "correct theorem or formula stated in full before applying it", tip: "State the theorem FIRST. e.g. 'By the binomial theorem: (a+b)ⁿ = ...' or 'Using Sₙ = a(1−rⁿ)/(1−r)'. No formula stated = no method mark for that step." },
      { key: "working",  label: "Show All Working Steps",        rows: 8, criteria: "every algebraic/arithmetic step shown; correct manipulation; rule stated at each stage", tip: "Show EVERY step. State which identity or rule you apply: 'using sin²θ + cos²θ = 1'. Never jump from the formula to the final line." },
      { key: "answer",   label: "Final Answer",                  rows: 2, criteria: "correct answer in simplest/required form; correct notation; correct significant figures", tip: "State the answer clearly. Check: matrices have correct brackets, complex numbers are in the required form (a+bi), vectors use correct notation. Simplify fully." },
    ],
  },

  // ── FRENCH ────────────────────────────────────────────────────────────────
  french_composition: {
    subject: "French", subjectKey: "french",
    label: "French Composition (Rédaction)",
    description: "Titre → Introduction → Développement → Conclusion",
    icon: BookOpen, color: "text-indigo-400", accent: "border-indigo-400/30 bg-indigo-400/5",
    markingNote: "Marks for: content/ideas, correct French grammar (verb-subject agreement, tense consistency, gender agreement), vocabulary variety, and organisation. Every grammar error costs marks. Use linking words to connect paragraphs.",
    sections: [
      { key: "titre",         label: "Titre (Title)",              rows: 1,  criteria: "relevant title written correctly in French", tip: "Write a short, relevant title in French. e.g. 'La Vie Scolaire en Afrique de l'Ouest'. It should relate directly to the topic." },
      { key: "introduction",  label: "Introduction",               rows: 3,  criteria: "introduces the topic clearly in French; states the purpose or sets the scene", tip: "2–3 sentences introducing the topic. e.g. 'Dans cette rédaction, je vais parler de...' or 'La vie dans mon pays est très intéressante parce que...' Don't start with 'I' — start with the topic." },
      { key: "developpement", label: "Développement (Body)",       rows: 10, criteria: "well-organised paragraphs; varied vocabulary; correct French grammar; ideas developed with examples", tip: "Write 2–3 paragraphs. Use linking words: 'D'abord', 'Ensuite', 'De plus', 'Cependant', 'Enfin'. Vary vocabulary — don't repeat the same words. Check gender agreement (le/la/les) and verb endings." },
      { key: "conclusion",    label: "Conclusion",                 rows: 3,  criteria: "clear conclusion that summarises the main point; appropriate closing", tip: "2–3 sentences. e.g. 'En conclusion, je pense que...' or 'Pour terminer, il est important de...'. Restate your main idea in different words. Don't introduce new content here." },
    ],
  },

  french_letter: {
    subject: "French", subjectKey: "french",
    label: "French Letter (Lettre)",
    description: "En-tête → Salutation → Corps → Formule de politesse → Signature",
    icon: BookOpen, color: "text-indigo-400", accent: "border-indigo-400/30 bg-indigo-400/5",
    markingNote: "Marks for correct format (address, date, salutation, closing formula), correct French grammar, and appropriate register. Formal and informal letters have DIFFERENT salutations and closing formulas — mixing them costs marks.",
    sections: [
      { key: "adresse_date", label: "Address + Date (En-tête)",          rows: 3, criteria: "your address top right; full date written in French; formal: recipient address on left", tip: "Your address top right. Then the date in French: 'le 25 avril 2026'. For formal letters, also add the recipient's address on the LEFT side." },
      { key: "salutation",   label: "Salutation (Formule d'appel)",      rows: 2, criteria: "correct salutation matching the register: formal or informal; ends with comma", tip: "FORMAL: 'Monsieur,' / 'Madame,' / 'Monsieur le Directeur,'\nINFORMAL: 'Cher Pierre,' / 'Chère Amie,'\n⚠️ Always end with a comma, not a full stop." },
      { key: "corps",        label: "Corps de la Lettre (Body)",         rows: 8, criteria: "clear purpose in first paragraph; well-organised content; correct French throughout", tip: "State your purpose first: 'Je vous écris pour...' (formal) or 'Je t'écris pour te dire que...' (informal). Organise into 2–3 paragraphs. No English words at all." },
      { key: "formule_fin",  label: "Formule de Politesse (Closing)",    rows: 2, criteria: "correct formal or informal closing formula that matches the salutation", tip: "FORMAL: 'Veuillez agréer, Monsieur/Madame, l'expression de mes salutations distinguées.'\nINFORMAL: 'Amicalement,' / 'Bien à toi,' / 'Je t'embrasse,'\n⚠️ Formal closing must echo the salutation word-for-word." },
      { key: "signature",    label: "Signature",                        rows: 1, criteria: "name signed below the closing formula", tip: "Write your name below the closing formula. No title needed for informal; formal: just your name." },
    ],
  },

  french_grammar: {
    subject: "French", subjectKey: "french",
    label: "French Grammar / Vocabulary",
    description: "Identify the rule → Apply correctly → Check agreement",
    icon: BookOpen, color: "text-indigo-400", accent: "border-indigo-400/30 bg-indigo-400/5",
    markingNote: "Each correctly answered item scores a mark. Common tested areas: verb conjugation (present, passé composé, imparfait, futur simple), gender/number agreement, pronouns, negation (ne…pas), prepositions. Spelling of conjugated forms matters.",
    sections: [
      { key: "rule",    label: "Identify the Grammar Rule",   rows: 2, criteria: "correctly identifies what grammar concept is being tested in the question", tip: "Before writing, name WHAT is being tested. e.g. 'This tests passé composé' or 'This tests adjective agreement'. Naming the rule focuses your thinking." },
      { key: "apply",   label: "Apply the Rule Correctly",    rows: 5, criteria: "correct conjugated/agreed form used; correct French spelling", tip: "Apply carefully:\n• Passé composé: avoir/être + past participle (check agreement with être verbs)\n• Adjective agreement: +e (feminine), +s (plural), +es (fem plural)\n• Negation: ne...pas wrap around the conjugated verb only" },
      { key: "check",   label: "Check Your Answers",          rows: 3, criteria: "each answer makes grammatical and logical sense in context", tip: "Read each answer aloud or in your head. Check:\n• Does the verb agree with the subject in person and number?\n• Are adjectives the right gender and number?\n• Is word order correct? (French: Subject-Verb-Object)" },
    ],
  },

  // ── AGRICULTURAL SCIENCE ─────────────────────────────────────────────────
  agriculture_theory: {
    subject: "Agricultural Science", subjectKey: "agriculture",
    label: "Theory Question",
    description: "Define → Explain process → Importance → West African example",
    icon: Leaf, color: "text-lime-400", accent: "border-lime-400/30 bg-lime-400/5",
    markingNote: "Marks for correct agricultural definition, clear explanation of the process or practice, specific importance/advantages (each point = marks), and realistic examples from West African farming. Use correct agricultural terminology.",
    sections: [
      { key: "definition",  label: "Define the Agricultural Term",    rows: 2,  criteria: "precise agricultural definition of the main concept or practice", tip: "Define clearly using agricultural language. e.g. 'Crop rotation is the practice of growing different types of crops in succession on the same piece of land to improve soil fertility and reduce pests and diseases.'" },
      { key: "explanation", label: "Explain the Process / Practice",  rows: 6,  criteria: "step-by-step or structured explanation of how it works; correct sequence; correct terms used", tip: "Explain HOW it works. For processes (germination, photosynthesis): give steps in order. For practices (irrigation, fertilisation): explain the method AND the reason for each step. Use agricultural vocabulary." },
      { key: "importance",  label: "Importance / Advantages",         rows: 5,  criteria: "at least 3 specific agricultural, economic, or environmental benefits; each explained", tip: "Give at least 3 SPECIFIC benefits. e.g. for crop rotation: '1. Restores soil nutrients depleted by the previous crop. 2. Breaks pest and disease cycles. 3. Reduces the farmer's cost of chemical fertilisers.' Each specific benefit = a mark." },
      { key: "example",     label: "West African Farming Example",    rows: 3,  criteria: "specific, realistic farming example from West Africa or The Gambia", tip: "Give a SPECIFIC local example. e.g. 'In The Gambia, groundnut farmers rotate their plots with millet or sorghum to restore nitrogen in the soil and reduce rosette disease in groundnuts.' Local examples show real understanding." },
    ],
  },

  agriculture_practical: {
    subject: "Agricultural Science", subjectKey: "agriculture",
    label: "Practical / Specimen Identification",
    description: "Identify → Describe features → Labeled diagram → Economic importance",
    icon: Leaf, color: "text-lime-400", accent: "border-lime-400/30 bg-lime-400/5",
    markingNote: "Marks for correct identification (common name AND scientific name), accurate feature description, a neat labeled diagram, and economic/agricultural importance. Missing the scientific name loses marks.",
    sections: [
      { key: "identification", label: "Identify the Specimen",         rows: 2,  criteria: "correct common name AND scientific name (genus species) of the specimen", tip: "Give BOTH names:\n• Common name: e.g. 'Maize'\n• Scientific name: e.g. 'Zea mays'\nScientific name: underline it in the exam. Capital letter for genus, lowercase for species." },
      { key: "description",    label: "Describe Key Features",         rows: 5,  criteria: "accurate description of visible features: colour, shape, texture, root type, leaf shape, stem type", tip: "Describe what you see using precise terms: 'lanceolate leaves', 'fibrous root system', 'monocotyledon', 'compound leaf', 'tap root', 'fleshy stem'. Avoid vague descriptions like 'greenish colour'." },
      { key: "diagram",        label: "Labeled Diagram",               rows: 6,  criteria: "neat, clear diagram with all major parts labeled using ruled lines; title below", tip: "Draw neatly. Label ALL major visible parts with ruled lines pointing to each structure. Write the title BELOW the diagram: 'Fig. 1: Diagram of a groundnut plant'. Good diagram = 2–3 marks." },
      { key: "importance",     label: "Economic / Agricultural Importance", rows: 4, criteria: "at least 3 specific uses or economic importance of the specimen", tip: "Give SPECIFIC uses. e.g. for groundnut: '1. Seeds eaten as food and pressed for cooking oil. 2. Groundnut cake used as livestock feed. 3. Root nodules fix atmospheric nitrogen, improving soil fertility. 4. Haulms used as animal fodder.'" },
    ],
  },

  // ── GEOGRAPHY ────────────────────────────────────────────────────────────
  geography_physical: {
    subject: "Geography", subjectKey: "geography",
    label: "Physical Geography Question",
    description: "Define → Explain formation/process (steps) → Labeled diagram → African examples",
    icon: Globe, color: "text-sky-400", accent: "border-sky-400/30 bg-sky-400/5",
    markingNote: "Diagrams are worth many marks in Geography. Label every feature, include a title, and use ruled lines. African examples are required — vague 'somewhere in Africa' earns nothing. Name the specific place and country.",
    sections: [
      { key: "definition",  label: "Define / Introduce the Feature",  rows: 2,  criteria: "correct geographical definition of the feature or process; type identified", tip: "Define the geographical term precisely. e.g. 'A waterfall is a sudden, near-vertical drop in a river's course, typically formed where resistant rock overlies softer rock.'" },
      { key: "formation",   label: "Explain Formation / Process",     rows: 6,  criteria: "step-by-step explanation of how the feature forms or the process occurs; correct sequence", tip: "Use numbered steps or 'firstly... then... as a result... eventually...'. Be specific about the geological/physical process — 'the river erodes the softer rock faster than the harder cap rock, creating an overhang which eventually collapses.'" },
      { key: "diagram",     label: "Labeled Diagram Critical",     rows: 8,  criteria: "neat cross-section or sketch; all parts correctly labeled; ruled label lines; title below diagram", tip: "⚠️ Geography diagrams are worth MANY marks. Draw neatly. Label every feature. Title BELOW the diagram. North arrow if it's a map. Use ruled lines for labels. A good diagram earns 4–6 marks alone." },
      { key: "examples",    label: "Named African / World Examples",  rows: 3,  criteria: "at least 2 specific named examples with country; correct geographical detail", tip: "Name SPECIFIC examples: 'Victoria Falls on the Zambia-Zimbabwe border' or 'Mount Cameroon (4,040m) in Cameroon'. Never say 'in some countries in Africa'. Name place AND country = marks." },
    ],
  },

  geography_human: {
    subject: "Geography", subjectKey: "geography",
    label: "Human / Economic Geography",
    description: "Define → Physical & human factors → Effects → West African examples",
    icon: Globe, color: "text-sky-400", accent: "border-sky-400/30 bg-sky-400/5",
    markingNote: "Cover BOTH physical factors (relief, climate, soil, water) and human factors (trade, transport, government policy). Each factor must be explained, not just listed. Always link your points to specific West African locations.",
    sections: [
      { key: "definition", label: "Define / Introduce the Concept",    rows: 2,  criteria: "clear geographical definition of the human geography concept", tip: "Define precisely. e.g. 'Urbanisation is the process by which an increasing proportion of a population comes to live in towns and cities, typically due to rural-to-urban migration and natural population growth in cities.'" },
      { key: "factors",    label: "Factors / Causes",                  rows: 7,  criteria: "at least 4 specific factors (physical AND human) explained clearly — not just listed", tip: "Give both PHYSICAL factors (relief, climate, soil fertility, water supply) and HUMAN factors (population growth, trade routes, government policy, employment). Explain each factor — 'flat fertile land in the river valley attracts farmers, leading to dense settlement.'" },
      { key: "effects",    label: "Effects / Consequences",            rows: 6,  criteria: "at least 3 specific effects; economic, social, AND environmental effects where relevant", tip: "Cover positive AND negative effects. Use specific economic terms: 'unemployment', 'overcrowding', 'strain on infrastructure', 'environmental degradation'. Never just say 'it causes problems' — say WHICH problem specifically." },
      { key: "examples",   label: "West African / African Examples",   rows: 4,  criteria: "specific named cities, regions, or countries from West Africa with correct details", tip: "SPECIFIC: 'Lagos, Nigeria, is the most densely populated city in West Africa with over 20 million people.' 'In The Gambia, over 60% of the population is concentrated along the Gambia River valley due to fertile soils and water access.' Name cities, regions, countries." },
    ],
  },

  geography_mapwork: {
    subject: "Geography", subjectKey: "geography",
    label: "Map Reading / Data Interpretation",
    description: "Read the map/data → Describe → Calculate → Explain patterns",
    icon: Globe, color: "text-sky-400", accent: "border-sky-400/30 bg-sky-400/5",
    markingNote: "Always quote map evidence for every statement you make. For distances: measure in cm then multiply by map scale. For grid references: use 4-figure (easting then northing). For descriptions: use compass directions and name specific features.",
    sections: [
      { key: "reading",     label: "Read and Identify Features",      rows: 3,  criteria: "correctly identifies features, grid references, or data values from the map/table/graph", tip: "Read carefully. Use 4-figure grid references (easting first, then northing). Name features by correct type: 'river', 'contour line', 'settlement'. Quote map evidence: 'The river flows from north to south in grid square 2304.'" },
      { key: "calculation", label: "Calculate (if required)",         rows: 4,  criteria: "correct method shown for distance, area, scale, gradient, or statistical calculation", tip: "Show ALL working. Distance: measure in cm × map scale. Gradient: vertical rise ÷ horizontal distance. Statistics: write the formula first, then calculate. Missing working = marks lost even if answer is correct." },
      { key: "description", label: "Describe the Pattern / Feature",  rows: 5,  criteria: "uses map/data evidence; describes direction, distribution, and pattern clearly with compass terms", tip: "Use compass directions (north-east, south-west). Quote specific values from the map/data. e.g. 'Contours are closely spaced in the north-west, indicating steep slopes. In the south-east, widely spaced contours suggest gentle terrain.'" },
      { key: "explanation", label: "Explain the Geographical Pattern", rows: 4, criteria: "geographical explanation of WHY the pattern or feature exists; uses correct geographical knowledge", tip: "Explain WHY using geography. e.g. 'The high population density in the south is due to fertile river alluvium, flat land suitable for agriculture, and proximity to the coast for trade.' Each geographical reason = marks." },
    ],
  },

  // ── LITERATURE IN ENGLISH ────────────────────────────────────────────────
  literature_prose: {
    subject: "Literature in English", subjectKey: "literature",
    label: "Prose Analysis",
    description: "Context → Theme/Character analysis → Quotes + analysis → Personal response",
    icon: BookOpen, color: "text-pink-400", accent: "border-pink-400/30 bg-pink-400/5",
    markingNote: "⚠️ NEVER retell the story — ANALYSE it. Every point must be supported by a quote from the text. A quote without analysis earns half marks. Use literary terms: characterisation, symbolism, irony, conflict, protagonist, motif.",
    sections: [
      { key: "context",   label: "Context / Introduction",           rows: 3,  criteria: "names text and author; identifies the relevant theme or character; brief context only", tip: "'[Title]' by [Author] is a [genre] set in [place/time] that explores the theme of [theme]. The question asks about [specific aspect].' — 2 sentences max, then move straight into analysis." },
      { key: "analysis",  label: "Thematic / Character Analysis",    rows: 8,  criteria: "analytical points about theme or character; supported by evidence; literary terms used; no plot summary", tip: "⚠️ DO NOT retell the story. ANALYSE it. Show HOW the author creates meaning. Use terms: characterisation, irony, foil, conflict, tragic flaw. e.g. 'The author uses dramatic irony to show...' Each analytical point = marks." },
      { key: "evidence",  label: "Textual Evidence (Quotes)",        rows: 5,  criteria: "at least 2 relevant quotes; each quote followed by analysis of meaning and effect", tip: "Quote, then ANALYSE. Format: '[Quote]' (chapter/page). This shows that... The word '[key word]' suggests... A quote without analysis = half marks. The analysis is what earns the marks." },
      { key: "response",  label: "Personal Response / Conclusion",   rows: 3,  criteria: "personal evaluation of the text's effectiveness; concludes by directly answering the question", tip: "Give YOUR view: 'I find this portrayal effective because...' or 'The author successfully conveys... through...' End by DIRECTLY answering the question. No new evidence here." },
    ],
  },

  literature_poetry: {
    subject: "Literature in English", subjectKey: "literature",
    label: "Poetry Analysis",
    description: "Poem + poet + context → Paraphrase → Themes → Devices → Effect on reader",
    icon: BookOpen, color: "text-pink-400", accent: "border-pink-400/30 bg-pink-400/5",
    markingNote: "Marks for: naming the poem and poet, paraphrasing key lines (shows understanding), identifying themes with evidence, naming AND explaining literary devices, and evaluating the poem's effect. Device without effect = half marks.",
    sections: [
      { key: "introduction", label: "Poem, Poet, and Context",        rows: 2,  criteria: "names poem and poet correctly; identifies subject, occasion, or background of the poem", tip: "'[Poem Title]' by [Poet Name] is a poem about [subject]. It was written in [context/period] and deals with the theme of [main theme]." },
      { key: "paraphrase",   label: "Paraphrase Key Lines",           rows: 4,  criteria: "accurate paraphrase of the most important or difficult lines; demonstrates understanding", tip: "Put the KEY lines in your own words — this shows you UNDERSTOOD the poem. Don't paraphrase every line, just the most important or most difficult ones." },
      { key: "themes",       label: "Themes + Textual Evidence",      rows: 6,  criteria: "at least 2 themes identified; each supported with a quote + analysis showing how the quote proves the theme", tip: "Name the theme, then quote, then EXPLAIN. e.g. 'The theme of death is shown in [quote] — this suggests that the poet views death as...' Theme + quote + analysis = full marks for that point." },
      { key: "devices",      label: "Literary Devices + Effects",     rows: 6,  criteria: "at least 3 devices named correctly; each with a quote; each followed by its effect on the reader", tip: "Name → Quote → Effect. e.g. 'Alliteration: \"The fair breeze blew\" — the repeated 'b' sound mimics the rushing wind, creating a sense of movement and energy.' Device without effect = half marks." },
      { key: "evaluation",   label: "Evaluation / Personal Response", rows: 3,  criteria: "evaluates the poet's skill; gives personal response to the poem's message or emotional effect", tip: "Give YOUR honest reaction. 'The poet effectively conveys grief through imagery and repetition, making the reader feel the weight of loss.' OR 'I find this poem powerful because...' Be specific about WHY it works." },
    ],
  },

  literature_drama: {
    subject: "Literature in English", subjectKey: "literature",
    label: "Drama Analysis",
    description: "Play + playwright + context → Character/Theme analysis → Dramatic techniques → Quotes",
    icon: BookOpen, color: "text-pink-400", accent: "border-pink-400/30 bg-pink-400/5",
    markingNote: "Drama is written to be PERFORMED. Show you know that: refer to stage directions, soliloquy, dramatic irony, aside. Do NOT narrate the plot. Use terms: tragedy, comedy, comic relief, dramatic tension, foil, catharsis.",
    sections: [
      { key: "context",    label: "Play, Playwright, Scene Context",  rows: 2,  criteria: "names play and playwright; identifies genre; specifies the scene or aspect being analysed", tip: "'[Play Title]' by [Playwright] is a [tragedy/comedy/tragicomedy] set in [place/time]. The question focuses on [character/theme/scene]." },
      { key: "analysis",   label: "Character / Theme Analysis",      rows: 8,  criteria: "analytical points on character development or thematic significance; no plot narration; act/scene references", tip: "ANALYSE — don't narrate. HOW does the character change? HOW does the theme develop? Refer to specific acts and scenes. Use: soliloquy, aside, dramatic irony, tragic flaw, foil, comic relief." },
      { key: "stagecraft", label: "Dramatic Techniques",             rows: 5,  criteria: "identifies and explains how dramatic devices create effect on stage: stage directions, soliloquy, irony, symbolism", tip: "Show how the playwright uses the STAGE. 'The stage direction [long pause] after this line creates tension for the audience.' 'The soliloquy in Act II reveals the character's true intentions.' Drama = performance, not just words." },
      { key: "evidence",   label: "Quotes + Analysis",               rows: 5,  criteria: "at least 2 direct quotes with act/scene reference; each followed by analysis of meaning and dramatic effect", tip: "Quote then analyse: '[Quote]' (Act II, Scene iii) — 'This line reveals... The word \"[key word]\" emphasises...' Always give the act and scene reference. Quote + analysis = full marks." },
      { key: "conclusion", label: "Conclusion / Evaluation",         rows: 3,  criteria: "personal evaluation of the playwright's skill; conclusion directly answering the question", tip: "Your view: 'Through [character]'s downfall, [Playwright] successfully explores the destructive nature of [theme].' Answer the question directly in your final sentence." },
    ],
  },

  // ── COMMERCE ─────────────────────────────────────────────────────────────
  commerce_theory: {
    subject: "Commerce", subjectKey: "commerce",
    label: "Theory / Essay Question",
    description: "Define → Numbered points (explained) → Advantages/Disadvantages → Business example",
    icon: ShoppingCart, color: "text-yellow-400", accent: "border-yellow-400/30 bg-yellow-400/5",
    markingNote: "Marks for correct definition, numbered points that are EXPLAINED (not just listed), advantages and disadvantages where relevant, and specific West African business examples. Numbering your points and explaining each one is the key to high marks.",
    sections: [
      { key: "definition",  label: "Define the Key Term",            rows: 2,  criteria: "precise commercial or business definition of the main concept", tip: "Define precisely with business vocabulary. e.g. 'A bill of exchange is an unconditional written order from one party (the drawer) to another (the drawee), directing the drawee to pay a fixed sum of money to a named person (the payee) at a specified future date.'" },
      { key: "explanation", label: "Explain with Numbered Points",   rows: 8,  criteria: "at least 4 clearly explained points about how it works, its features, or its functions; each point explained in 2 sentences", tip: "Number your points: 1. 2. 3. Each point: state it, then explain it in 1–2 sentences. Use business vocabulary: credit, invoice, consignment, intermediary, chain of distribution, markup, wholesale." },
      { key: "advantages",  label: "Advantages and Disadvantages",   rows: 5,  criteria: "at least 2 advantages AND 2 disadvantages, each explained", tip: "Give both sides unless the question only asks for one. Each point needs a brief explanation — not just 'it is good' but 'it allows buyers to acquire expensive goods without full immediate payment, improving access to capital goods.'" },
      { key: "example",     label: "West African Business Example",  rows: 3,  criteria: "specific, realistic business example from West Africa or The Gambia", tip: "SPECIFIC: 'In The Gambia, the Gambia Revenue Authority uses bills of lading as proof of shipment for goods imported through Banjul Port.' Vague 'businesses use this' = zero marks here." },
    ],
  },

  // ── COMPUTER SCIENCE ─────────────────────────────────────────────────────
  computer_theory: {
    subject: "Computer Science", subjectKey: "computer",
    label: "Theory / Definition Question",
    description: "Define (technical) → Explain how it works → Examples → Advantages/Disadvantages",
    icon: Monitor, color: "text-violet-400", accent: "border-violet-400/30 bg-violet-400/5",
    markingNote: "Use correct computing terminology — vague answers like 'it stores stuff' earn zero. Name specific protocols, hardware components, and software types. Advantages and disadvantages must each be explained, not just listed.",
    sections: [
      { key: "definition",  label: "Define the Computing Term",      rows: 2,  criteria: "precise technical definition using correct computing terminology", tip: "Define with technical precision. e.g. 'Random Access Memory (RAM) is a type of volatile primary memory that temporarily stores data and program instructions currently being used by the CPU, allowing fast read and write access.'" },
      { key: "explanation", label: "Explain How It Works",           rows: 6,  criteria: "clear explanation of function, mechanism, or process using correct technical language", tip: "Explain HOW it works technically. Use correct terms: CPU, input/output, binary, bit, byte, bus, protocol, packet, bandwidth, hardware, software, operating system. Vague explanations earn zero." },
      { key: "examples",    label: "Specific Examples",              rows: 3,  criteria: "real, specific examples of the computing concept in practice", tip: "Give SPECIFIC examples. For RAM: 'Examples include DDR4 SDRAM used in modern laptops.' For networks: name actual protocols (HTTP, TCP/IP, FTP, SMTP). For software: name actual programs or types." },
      { key: "advantages",  label: "Advantages and Disadvantages",   rows: 4,  criteria: "at least 2 advantages and 2 limitations, each explained clearly", tip: "Balance: Advantage + explanation. Disadvantage + explanation. e.g. Cloud storage: Advantage: 'Accessible from any device with internet.' Disadvantage: 'Requires a stable internet connection and raises data privacy concerns.'" },
    ],
  },

  computer_algorithm: {
    subject: "Computer Science", subjectKey: "computer",
    label: "Algorithm / Flowchart / Pseudocode",
    description: "IPO → Variables → Pseudocode → Flowchart → Test/Trace",
    icon: Monitor, color: "text-violet-400", accent: "border-violet-400/30 bg-violet-400/5",
    markingNote: "Use standard pseudocode keywords: INPUT, OUTPUT/PRINT, IF…THEN…ELSE…ENDIF, WHILE…DO…ENDWHILE, FOR…TO…NEXT. Flowchart symbols must be correct: oval=start/end, parallelogram=I/O, rectangle=process, diamond=decision. Show a trace table to prove your algorithm works.",
    sections: [
      { key: "understand", label: "Understand the Problem (IPO)",    rows: 3,  criteria: "states input(s), process, and output(s) clearly for the problem", tip: "Write:\nInput: [what the user/system provides]\nProcess: [what calculation or decision is made]\nOutput: [what is displayed or returned]\nThis is IPO analysis — it proves you understood the problem." },
      { key: "variables",  label: "Declare Variables",               rows: 3,  criteria: "all variables listed with meaningful names and correct data types", tip: "List every variable you need. Give meaningful names and data types. e.g. 'score : INTEGER', 'name : STRING', 'average : REAL', 'found : BOOLEAN'. Good names make your algorithm readable." },
      { key: "algorithm",  label: "Algorithm / Pseudocode",          rows: 8,  criteria: "logical steps in correct sequence; correct pseudocode keywords; loops and conditions indented", tip: "Use standard pseudocode: START, INPUT, OUTPUT/PRINT, IF…THEN…ELSE…ENDIF, WHILE…DO…ENDWHILE, FOR i ← 1 TO n … NEXT i. Each step on its own line. INDENT loops and IF blocks." },
      { key: "flowchart",  label: "Flowchart (if required)",         rows: 6,  criteria: "correct symbols used: oval=start/end, parallelogram=I/O, rectangle=process, diamond=decision; arrows show flow", tip: "CORRECT SYMBOLS ONLY:\n• Oval = START / STOP\n• Parallelogram = INPUT / OUTPUT\n• Rectangle = PROCESS (calculation)\n• Diamond = DECISION (Yes/No question only)\n• Arrows connect all shapes" },
      { key: "trace",      label: "Trace Table / Test",              rows: 4,  criteria: "trace table with correct variable values at each step for given test data; shows algorithm works", tip: "Create a table: columns = each variable + output. Rows = each step of the algorithm for your test data. Fill in values step by step. This PROVES your algorithm is correct." },
    ],
  },

  // ── CHRISTIAN RELIGIOUS KNOWLEDGE ────────────────────────────────────────
  crk_essay: {
    subject: "CRK", subjectKey: "crk",
    label: "Essay / Biblical Theme Question",
    description: "Biblical context + scripture → Main points with references → Lessons → Application today",
    icon: BookOpen, color: "text-rose-400", accent: "border-rose-400/30 bg-rose-400/5",
    markingNote: "Every point MUST have a scriptural reference (Book Chapter:Verse). Citing the wrong scripture costs marks. State lessons for Christians separately. End with application to modern Christian life — be specific and practical.",
    sections: [
      { key: "introduction", label: "Introduction + Biblical Context", rows: 3,  criteria: "introduces the theme with correct biblical context; identifies the relevant scripture or event", tip: "Introduce the theme and its biblical context. e.g. 'The theme of forgiveness is central to Christian teaching. In Matthew 18:21–35 (the Parable of the Unforgiving Servant), Jesus teaches that Christians must forgive unlimited times.'" },
      { key: "main_points",  label: "Main Points with Scripture",     rows: 10, criteria: "at least 4 points; each with a correct scriptural reference (Book Chapter:Verse); each explained in 2 sentences", tip: "Format: 'Firstly, [point] (Book Chapter:Verse). This shows that...' e.g. 'The Bible teaches that God forgives all sins (1 John 1:9). This means Christians are also called to forgive others.' Scripture without explanation = half marks." },
      { key: "lessons",      label: "Moral / Spiritual Lessons",      rows: 4,  criteria: "at least 3 specific lessons Christians can learn; each stated and explained", tip: "SPECIFIC lessons: '1. Christians must forgive because God commands it, not just when they feel ready. 2. Holding grudges separates us from God's forgiveness (Matthew 6:15). 3. True forgiveness must come from the heart, not just in words.' Each lesson = a mark." },
      { key: "application",  label: "Relevance to Christians Today",  rows: 3,  criteria: "applies the biblical teaching specifically to contemporary Christian life or society", tip: "How does this apply TODAY? e.g. 'A Christian student who is bullied can apply this teaching by choosing not to retaliate, and by praying for those who wrong them (Matthew 5:44), reflecting Christ's teaching in their daily life.'" },
    ],
  },

  // ── ISLAMIC RELIGIOUS EDUCATION ───────────────────────────────────────────
  ire_essay: {
    subject: "IRE", subjectKey: "ire",
    label: "Essay / Islamic Theme Question",
    description: "Quranic/Hadith reference → Explanation → More evidence → Lessons → Application",
    icon: BookOpen, color: "text-teal-400", accent: "border-teal-400/30 bg-teal-400/5",
    markingNote: "Every point must be supported by a Quranic verse (Surah name and chapter:verse) or a Hadith (narrator cited). Incorrect references cost marks. Use correct Arabic terms and explain them. End with specific application to Muslim life today.",
    sections: [
      { key: "introduction", label: "Introduction + Quranic Reference", rows: 3, criteria: "introduces the Islamic theme with a correct Quranic verse or Hadith reference", tip: "Open with a reference: 'Allah says in the Quran (Surah [Name], [Ch]:[V]): \"[translation]\".' OR 'The Prophet (SAW) said: \"[Hadith]\" (narrated by [companion]).' This immediately shows your Islamic knowledge." },
      { key: "explanation",  label: "Explain the Islamic Teaching",    rows: 6, criteria: "clear explanation using correct Islamic terminology (Arabic terms with meanings); correct understanding", tip: "Explain the teaching clearly. Use Arabic terms correctly and DEFINE them: 'Salat (the five daily prayers), Zakat (obligatory almsgiving), Taqwa (God-consciousness/piety), Tawbah (sincere repentance).' Define every Arabic term you use." },
      { key: "evidence",     label: "Additional Quranic / Hadith Evidence", rows: 5, criteria: "at least 2 more correctly cited Quranic verses or Hadiths supporting your points", tip: "Support each main point: 'As Allah says: \"[verse]\" (Surah X:Y).' or 'The Prophet (SAW) said: \"[Hadith]\" (Bukhari/Muslim).' Correct citation = marks. Wrong citation = marks lost." },
      { key: "lessons",      label: "Lessons for Muslims",             rows: 4, criteria: "at least 3 specific moral or spiritual lessons for Muslims; each explained", tip: "SPECIFIC lessons: '1. Muslims must be honest in all dealings, as dishonesty (Ghish) is strictly forbidden. 2. This teaches us to maintain Taqwa in private as well as in public. 3. Muslims should treat all people with justice (Adl) regardless of religion or status.'" },
      { key: "application",  label: "Relevance to Muslim Life Today", rows: 3, criteria: "applies the Islamic teaching specifically to contemporary Muslim life — student, family, community, or society", tip: "How does this apply TODAY? Be specific: 'A Muslim student should avoid cheating in exams because Islam requires Sidq (truthfulness) in all actions. Allah sees everything we do, even in private, and we will be accountable on the Day of Judgement (Qiyamah).'" },
    ],
  },

  // ── FOOD AND NUTRITION ────────────────────────────────────────────────────
  food_nutrition_theory: {
    subject: "Food & Nutrition", subjectKey: "food_nutrition",
    label: "Theory / Nutrients Question",
    description: "Define → Types & sources → Body functions → Deficiency disease → Prevention",
    icon: Utensils, color: "text-orange-300", accent: "border-orange-300/30 bg-orange-300/5",
    markingNote: "Name every food source specifically (not just 'meat' — say 'beef, chicken, fish, eggs'). Name the exact deficiency disease AND its symptoms. Functions must be physiologically specific — 'it's good for you' earns zero.",
    sections: [
      { key: "definition",    label: "Define the Nutrient / Concept",  rows: 2,  criteria: "precise definition of the nutrient, food concept, or process using nutritional terminology", tip: "Define clearly. e.g. 'Proteins are complex organic macromolecules composed of amino acids, linked by peptide bonds, essential for the growth, repair, and maintenance of all body tissues.'" },
      { key: "types_sources", label: "Types and Food Sources",         rows: 5,  criteria: "at least 3 types or classifications; specific food sources named for each type", tip: "SPECIFIC food sources. Not 'meat' — say 'beef, chicken, fish, eggs, beans, groundnuts, soya beans'. For vitamins: name fat-soluble (A, D, E, K) and water-soluble (B-group, C). Each named source = marks." },
      { key: "functions",     label: "Functions in the Body",          rows: 5,  criteria: "at least 3 specific physiological functions; correct body processes named", tip: "Be physiologically SPECIFIC. e.g. for iron: 'Iron is a component of haemoglobin in red blood cells, which transports oxygen from the lungs to body tissues.' NOT 'iron is good for blood.'" },
      { key: "deficiency",    label: "Deficiency Disease + Symptoms",  rows: 4,  criteria: "correct name of deficiency disease; at least 3 specific symptoms; groups at risk", tip: "Name the disease AND 3+ symptoms. e.g. 'Vitamin C deficiency causes Scurvy. Symptoms include: bleeding gums, delayed wound healing, swollen and painful joints, extreme fatigue, and skin bruising.' Disease name + symptoms = full marks." },
      { key: "prevention",    label: "Prevention / Dietary Advice",    rows: 3,  criteria: "practical, specific dietary advice for preventing the deficiency; balanced diet information", tip: "Give practical advice: 'To prevent iron-deficiency anaemia, include iron-rich foods such as liver, red meat, beans, and dark leafy vegetables daily. Eating vitamin C alongside iron-rich foods increases iron absorption significantly.'" },
    ],
  },

  food_nutrition_practical: {
    subject: "Food & Nutrition", subjectKey: "food_nutrition",
    label: "Practical / Recipe and Method",
    description: "Ingredients + quantities → Equipment → Step-by-step method → Presentation",
    icon: Utensils, color: "text-orange-300", accent: "border-orange-300/30 bg-orange-300/5",
    markingNote: "Quantities are required for every ingredient — missing them loses marks. Use correct cooking verbs: sift, whisk, fold, simmer, sauté, blanch, reduce. Include temperatures and times. Correct equipment names (not 'a pot' but 'a medium saucepan').",
    sections: [
      { key: "ingredients",  label: "Ingredients with Quantities",    rows: 6,  criteria: "all ingredients listed with correct quantities or measurements; correct units used", tip: "EVERY ingredient needs a quantity. e.g. '200g rice flour', '50ml groundnut oil', '2 eggs (size 3)', '1 tsp baking powder', '250ml warm water'. Missing quantities = marks lost." },
      { key: "equipment",    label: "Equipment Needed",               rows: 3,  criteria: "all major cooking equipment listed with correct names", tip: "Use correct names: 'medium mixing bowl', 'wooden spoon', 'fine mesh sieve', '20cm round baking tin', 'domestic oven', 'slotted spoon', 'colander'. Not 'a pot' — say 'a 2-litre saucepan'." },
      { key: "method",       label: "Step-by-Step Method",            rows: 8,  criteria: "logical numbered steps; correct cooking techniques named; temperatures and times stated", tip: "Number every step. Use cooking verbs: sift, whisk, fold, simmer, sauté, blanch, reduce, season, garnish. Include temperatures and times: 'Bake at 180°C for 25–30 minutes until golden brown.'" },
      { key: "presentation", label: "Presentation / Serving",         rows: 2,  criteria: "appropriate garnish and serving suggestions; correct serving temperature stated", tip: "Describe how to present. e.g. 'Serve hot on a warmed plate, garnished with fresh chopped parsley. Accompany with steamed white rice and a fresh green salad. Serves 4.' Marks for practical knowledge of presentation." },
    ],
  },

  // ── HISTORY ──────────────────────────────────────────────────────────────
  history_essay: {
    subject: "History", subjectKey: "history",
    label: "Historical Essay",
    description: "Intro + period → Causes (dates) → Events (chronological) → Consequences → Significance",
    icon: BookOpen, color: "text-amber-500", accent: "border-amber-500/30 bg-amber-500/5",
    markingNote: "Dates matter — wrong dates lose marks. Name specific people, places, organisations, and treaties. Distinguish between short-term and long-term causes. Always bring consequences back to West Africa or The Gambia where relevant.",
    sections: [
      { key: "introduction",  label: "Introduction + Historical Period", rows: 3,  criteria: "introduces the topic; identifies the historical period, region, and key actors; context given", tip: "State the time period, region, and key actors. e.g. 'The transatlantic slave trade, operating between the 15th and 19th centuries, fundamentally transformed the relationship between West Africa, Europe, and the Americas, depopulating entire regions and reshaping global economic systems.'" },
      { key: "causes",        label: "Causes / Background",             rows: 6,  criteria: "at least 3 specific causes with dates; long-term and immediate causes distinguished", tip: "Distinguish LONG-TERM (background) from IMMEDIATE (trigger) causes. e.g. 'Long-term cause: European demand for labour in New World plantations from the 1500s. Immediate cause: the collapse of the indigenous Amerindian population after European contact, creating a labour shortage.'" },
      { key: "events",        label: "Key Events (Chronological)",      rows: 6,  criteria: "key events listed in correct chronological order with correct dates and named actors", tip: "LIST events IN ORDER with dates. Name specific people, treaties, organisations. e.g. '1807: Britain abolished the slave trade (Abolition Act). 1820: The Royal Navy's West Africa Squadron began patrolling the coast. 1833: Full abolition of slavery in British colonies.' Wrong dates = marks lost." },
      { key: "consequences",  label: "Consequences / Effects",          rows: 5,  criteria: "short-term AND long-term effects; political, economic, AND social effects; effects on West Africa", tip: "Cover SHORT-TERM (immediate aftermath) AND LONG-TERM (decades/centuries later) effects. Address political, economic, and social effects. Always bring it back to West Africa: 'This led to the depopulation of coastal West African societies, particularly among the Wolof and Mandinka peoples.'" },
      { key: "significance",  label: "Historical Significance",         rows: 3,  criteria: "explains why this event matters in African history; links to the present day where possible", tip: "WHY does this matter in history? What changed permanently? How does it affect West Africa today? e.g. 'The arbitrary borders drawn at the Berlin Conference continue to cause ethnic conflict and political instability across West Africa today.'" },
    ],
  },

  history_source: {
    subject: "History", subjectKey: "history",
    label: "Source Analysis",
    description: "Identify source → Content → Origin + Purpose → Reliability/Bias → Usefulness",
    icon: BookOpen, color: "text-amber-500", accent: "border-amber-500/30 bg-amber-500/5",
    markingNote: "Structure your answer in the same order as the questions: identity → content → origin/purpose → reliability → usefulness. Quote one key phrase from the source as evidence. Always state what the source CANNOT tell us, not just what it can.",
    sections: [
      { key: "identity",       label: "Identify the Source",           rows: 2,  criteria: "states source type (primary/secondary), author/origin, date if available", tip: "State: PRIMARY (written at the time, by someone involved) or SECONDARY (written later by historians)? Who created it? When? e.g. 'This is a primary source — an extract from a speech delivered by [name] in [year].'" },
      { key: "content",        label: "What Does the Source Say?",     rows: 3,  criteria: "accurate summary of the source's main argument or information in your own words; one short quote", tip: "Summarise the main argument in your own words. You may quote ONE short phrase. e.g. 'The source argues that... The author claims that... The data shows a rise in... The source suggests...' Keep to the content — no analysis yet." },
      { key: "origin_purpose", label: "Origin and Purpose",            rows: 3,  criteria: "analyses WHY the source was created; who was the intended audience; what the author wanted to achieve", tip: "WHY was this source created? Who was the audience? What was the author's purpose? e.g. 'This speech was delivered to a nationalist rally, so the author deliberately exaggerated colonial grievances to inspire political action.'" },
      { key: "reliability",    label: "Reliability and Bias",          rows: 3,  criteria: "identifies specific reasons why the source is or is not reliable; evidence of bias stated and explained", tip: "Consider: Does the author have reason to lie or exaggerate? Is it consistent with other historical sources? e.g. 'This source may be biased because the author was a colonial official who had a professional interest in minimising reports of African resistance.'" },
      { key: "usefulness",     label: "Usefulness to Historians",      rows: 3,  criteria: "explains what the source IS useful for AND what it cannot tell us; balanced evaluation", tip: "State what it IS useful for AND what it CANNOT tell us. e.g. 'This source is useful for understanding how colonial administrators justified their policies. However, it tells us nothing about how ordinary Africans experienced or responded to those same policies.'" },
    ],
  },

  // ── HEALTH EDUCATION ─────────────────────────────────────────────────────
  health_education_theory: {
    subject: "Health Education", subjectKey: "health_education",
    label: "Theory / Health Question",
    description: "Define → Causes/Types → Symptoms → Prevention → Treatment + Public health impact",
    icon: Heart, color: "text-fuchsia-400", accent: "border-fuchsia-400/30 bg-fuchsia-400/5",
    markingNote: "Name the causative agent specifically (bacteria/virus/parasite). List symptoms with correct medical terms. Prevention measures must be specific — 'avoid mosquitoes' earns zero, 'use insecticide-treated bed nets (ITNs)' earns marks. Name drugs/treatments where possible.",
    sections: [
      { key: "definition",   label: "Define the Health Concept",      rows: 2,  criteria: "precise definition of the disease, condition, or health concept using medical terminology", tip: "Define clearly using medical terms. e.g. 'Malaria is an infectious disease caused by the Plasmodium parasite (a protozoan), transmitted to humans through the bites of infected female Anopheles mosquitoes.'" },
      { key: "causes_types", label: "Causes / Types / Risk Factors",  rows: 4,  criteria: "correct causative agent (bacteria/virus/parasite/lifestyle); types or risk factors listed and explained", tip: "State the CAUSE and types. For malaria: 'Caused by 4 Plasmodium species — P. falciparum (most deadly, responsible for most deaths in Africa), P. vivax, P. malariae, P. ovale.' For lifestyle diseases: list specific risk factors." },
      { key: "symptoms",     label: "Signs and Symptoms",             rows: 4,  criteria: "at least 4 specific clinical signs and symptoms using correct medical terms", tip: "List SPECIFIC symptoms: 'High fever (38°C+), rigors (violent chills), severe headache, nausea, vomiting, profuse sweating, joint and muscle pain, fatigue, anaemia (pallor).' Each named symptom = a mark. Not 'feeling sick.'" },
      { key: "prevention",   label: "Prevention / Control Measures",  rows: 5,  criteria: "at least 3 specific and practical prevention measures; correct public health terminology", tip: "SPECIFIC: 'Use insecticide-treated bed nets (ITNs), apply indoor residual spraying (IRS) with pyrethroid insecticides, eliminate stagnant water breeding sites around the home, take antimalarial prophylaxis when travelling to high-risk areas.' Vague = zero marks." },
      { key: "treatment",    label: "Treatment + Public Health Impact", rows: 4, criteria: "correct treatment methods (drug names if known); public health significance; community or government role", tip: "Name treatment specifically. e.g. 'Treated with artemisinin-combination therapy (ACT) such as artemether-lumefantrine.' Then state the community impact: 'Malaria kills over 400,000 people annually in sub-Saharan Africa and costs West African economies billions in lost productivity and healthcare spending.'" },
    ],
  },
};

// ── Subject groups for the setup screen ──────────────────────────────────────
const SUBJECT_GROUPS = [
  {
    subject: "Physics",
    color: "text-blue-400",
    bgActive: "bg-blue-400/10 border-blue-400/40",
    bg: "border-[var(--border)]",
    types: ["physics_calculation", "physics_theory"],
  },
  {
    subject: "Chemistry",
    color: "text-green-400",
    bgActive: "bg-green-400/10 border-green-400/40",
    bg: "border-[var(--border)]",
    types: ["chemistry_equation", "chemistry_practical"],
  },
  {
    subject: "Biology",
    color: "text-emerald-400",
    bgActive: "bg-emerald-400/10 border-emerald-400/40",
    bg: "border-[var(--border)]",
    types: ["biology_explanation", "biology_comparison"],
  },
  {
    subject: "Mathematics",
    color: "text-purple-400",
    bgActive: "bg-purple-400/10 border-purple-400/40",
    bg: "border-[var(--border)]",
    types: ["mathematics_calculation", "mathematics_proof"],
  },
  {
    subject: "Economics",
    color: "text-amber-400",
    bgActive: "bg-amber-400/10 border-amber-400/40",
    bg: "border-[var(--border)]",
    types: ["economics_theory"],
  },
  {
    subject: "Accounting",
    color: "text-cyan-400",
    bgActive: "bg-cyan-400/10 border-cyan-400/40",
    bg: "border-[var(--border)]",
    types: ["accounting_ledger", "accounting_trial_balance"],
  },
  {
    subject: "Government",
    color: "text-orange-400",
    bgActive: "bg-orange-400/10 border-orange-400/40",
    bg: "border-[var(--border)]",
    types: ["government_essay"],
  },
  {
    subject: "Further Mathematics",
    color: "text-purple-300",
    bgActive: "bg-purple-300/10 border-purple-300/40",
    bg: "border-[var(--border)]",
    types: ["further_maths_calculation"],
  },
  {
    subject: "French",
    color: "text-indigo-400",
    bgActive: "bg-indigo-400/10 border-indigo-400/40",
    bg: "border-[var(--border)]",
    types: ["french_composition", "french_letter", "french_grammar"],
  },
  {
    subject: "Agricultural Science",
    color: "text-lime-400",
    bgActive: "bg-lime-400/10 border-lime-400/40",
    bg: "border-[var(--border)]",
    types: ["agriculture_theory", "agriculture_practical"],
  },
  {
    subject: "Geography",
    color: "text-sky-400",
    bgActive: "bg-sky-400/10 border-sky-400/40",
    bg: "border-[var(--border)]",
    types: ["geography_physical", "geography_human", "geography_mapwork"],
  },
  {
    subject: "Literature in English",
    color: "text-pink-400",
    bgActive: "bg-pink-400/10 border-pink-400/40",
    bg: "border-[var(--border)]",
    types: ["literature_prose", "literature_poetry", "literature_drama"],
  },
  {
    subject: "Commerce",
    color: "text-yellow-400",
    bgActive: "bg-yellow-400/10 border-yellow-400/40",
    bg: "border-[var(--border)]",
    types: ["commerce_theory"],
  },
  {
    subject: "Computer Science",
    color: "text-violet-400",
    bgActive: "bg-violet-400/10 border-violet-400/40",
    bg: "border-[var(--border)]",
    types: ["computer_theory", "computer_algorithm"],
  },
  {
    subject: "CRK",
    color: "text-rose-400",
    bgActive: "bg-rose-400/10 border-rose-400/40",
    bg: "border-[var(--border)]",
    types: ["crk_essay"],
  },
  {
    subject: "IRE",
    color: "text-teal-400",
    bgActive: "bg-teal-400/10 border-teal-400/40",
    bg: "border-[var(--border)]",
    types: ["ire_essay"],
  },
  {
    subject: "Food & Nutrition",
    color: "text-orange-300",
    bgActive: "bg-orange-300/10 border-orange-300/40",
    bg: "border-[var(--border)]",
    types: ["food_nutrition_theory", "food_nutrition_practical"],
  },
  {
    subject: "History",
    color: "text-amber-500",
    bgActive: "bg-amber-500/10 border-amber-500/40",
    bg: "border-[var(--border)]",
    types: ["history_essay", "history_source"],
  },
  {
    subject: "Health Education",
    color: "text-fuchsia-400",
    bgActive: "bg-fuchsia-400/10 border-fuchsia-400/40",
    bg: "border-[var(--border)]",
    types: ["health_education_theory"],
  },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
function gradeColor(grade: string) {
  const g = grade?.toUpperCase() || "";
  if (g === "A1") return "text-emerald-400";
  if (g === "B2" || g === "B3") return "text-blue-400";
  if (g === "C4" || g === "C5" || g === "C6") return "text-amber-400";
  return "text-red-400";
}

function ScoreBar({ score, max, label, color }: { score: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[var(--text-muted)]">{label}</span>
        <span className={`font-bold ${color}`}>{score}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct >= 70 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TipBox({ tip }: { tip: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--em)] hover:bg-[var(--em)]/5 transition-colors"
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <Lightbulb className="w-3.5 h-3.5" /> How to write this section
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{tip}</p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type Phase = "setup" | "writing" | "results";

export default function SubjectLabPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("setup");
  const [answerType, setAnswerType] = useState<SubjectAnswerType>("physics_calculation");
  const [question, setQuestion] = useState("");
  const [sections, setSections] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [coaching, setCoaching] = useState<Record<string, string>>({});
  const [coachingLoading, setCoachingLoading] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<SubjectGradeResult | null>(null);
  const [gradeError, setGradeError] = useState("");

  const def = TYPE_DEFS[answerType];
  const Icon = def.icon;

  // Reset on type change
  const handleTypeChange = useCallback((type: SubjectAnswerType) => {
    setAnswerType(type);
    setSections({});
    setCoaching({});
    setActiveSection(null);
    setQuestion("");
  }, []);

  const updateSection = useCallback((key: string, value: string) => {
    setSections(prev => ({ ...prev, [key]: value }));
    setCoaching(prev => {
      if (prev[key]) { const n = { ...prev }; delete n[key]; return n; }
      return prev;
    });
  }, []);

  async function coachSection(sectionKey: string) {
    const text = sections[sectionKey] || "";
    if (!text.trim()) return;
    setCoachingLoading(sectionKey);
    setActiveSection(sectionKey);
    try {
      const res = await subjectLabAPI.coach({
        answer_type: answerType,
        section_key: sectionKey,
        section_text: text,
        question,
      });
      setCoaching(prev => ({ ...prev, [sectionKey]: res.feedback }));
    } catch {
      setCoaching(prev => ({ ...prev, [sectionKey]: "Coach unavailable. Check your section against the tip." }));
    } finally {
      setCoachingLoading(null);
    }
  }

  async function gradeAnswer() {
    const hasContent = def.sections.some(s => (sections[s.key] || "").trim().length > 10);
    if (!hasContent) { setGradeError("Write something in at least one section first."); return; }
    setGrading(true);
    setGradeError("");
    try {
      const result = await subjectLabAPI.grade({ answer_type: answerType, sections, question });
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

  const filledCount = def.sections.filter(s => (sections[s.key] || "").trim().length > 10).length;

  // ── SETUP ────────────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-white mb-1">Subject Answer Lab</h1>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            Write your answer section by section. AI coaches you on each step based on how WAEC examiners actually mark.
          </p>

          <div className="glass rounded-2xl p-5 space-y-6">

            {/* Subject groups */}
            {SUBJECT_GROUPS.map(group => (
              <div key={group.subject}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${group.color}`}>
                  {group.subject}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(group.types as readonly SubjectAnswerType[]).map(typeKey => {
                    const d = TYPE_DEFS[typeKey];
                    const isSelected = answerType === typeKey;
                    return (
                      <button
                        key={typeKey}
                        onClick={() => handleTypeChange(typeKey)}
                        className={[
                          "text-left px-4 py-3 rounded-xl border text-sm transition-all",
                          isSelected
                            ? group.bgActive + " " + group.color
                            : "glass text-[var(--text-muted)] hover:text-[var(--text)] hover:border-white/20",
                        ].join(" ")}
                      >
                        <p className="font-semibold text-sm">{d.label}</p>
                        <p className="text-[11px] opacity-70 mt-0.5">{d.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Question input */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                Paste Your Question
              </label>
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                rows={3}
                placeholder="Paste or type the question here. e.g. 'A car of mass 800 kg accelerates from rest to 20 m/s in 10 s. Calculate the force applied.'"
                className="w-full bg-[#16161f] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] text-sm outline-none focus:border-[var(--em)] resize-none placeholder:text-[var(--text-dim)] transition-colors"
              />
            </div>

            {/* Marking note */}
            <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 ${def.accent}`}>
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${def.color}`} />
              <div>
                <p className={`text-xs font-semibold ${def.color} mb-0.5`}>
                  {def.subject} — How WAEC Marks This
                </p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{def.markingNote}</p>
              </div>
            </div>

            <button
              onClick={() => { if (!question.trim()) return; setPhase("writing"); }}
              disabled={!question.trim()}
              className="w-full py-3 rounded-xl bg-[var(--em)] text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Start Answering →
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── RESULTS ─────────────────────────────────────────────────────────────────
  if (phase === "results" && gradeResult) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Your Results</h1>
              <p className="text-[var(--text-muted)] text-sm">{def.subject} — {def.label}</p>
            </div>
            <button
              onClick={restart}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--em)] border border-[var(--border)] px-3 py-2 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>

          {/* Big score */}
          <div className="glass rounded-2xl p-6 flex items-center gap-5">
            <div className="shrink-0 w-24 h-24 rounded-2xl bg-[var(--em)]/10 flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold ${gradeColor(gradeResult.grade)}`}>
                {gradeResult.grade}
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-1">
                {gradeResult.total}/{gradeResult.max}
              </span>
            </div>
            <div className="flex-1">
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

          {/* Per-section breakdown */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-white">Section Breakdown</h2>
            {gradeResult.sections.map(sec => (
              <div key={sec.key}>
                <ScoreBar
                  score={sec.score}
                  max={sec.max}
                  label={sec.label}
                  color={sec.score / sec.max >= 0.7 ? "text-emerald-400" : sec.score / sec.max >= 0.5 ? "text-amber-400" : "text-red-400"}
                />
                {sec.feedback && (
                  <p className="text-xs text-[var(--text-muted)] mt-1 ml-0.5 leading-relaxed">{sec.feedback}</p>
                )}
                {sec.missing && (
                  <p className="text-xs text-red-400/80 mt-0.5 ml-0.5 flex items-start gap-1">
                    <XCircle className="w-3 h-3 shrink-0 mt-0.5" /> Missing: {sec.missing}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Top improvements */}
          {gradeResult.top_improvements?.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Fix These Next Time
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

          <div className="flex gap-3 pb-8">
            <button
              onClick={() => setPhase("writing")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Revise Answer
            </button>
            <button
              onClick={restart}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--em)] text-black text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" /> New Question
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── WRITING WORKSPACE ────────────────────────────────────────────────────────
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
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${def.color}`} />
              <p className="text-sm font-semibold text-white">{def.subject} — {def.label}</p>
            </div>
            <p className="text-[11px] text-[var(--text-dim)] truncate max-w-[200px] sm:max-w-md mt-0.5">{question}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)] hidden sm:block">
            {filledCount}/{def.sections.length} sections
          </span>
          <button
            onClick={gradeAnswer}
            disabled={grading || filledCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--em)] text-black text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {grading
              ? <><Zap className="w-3.5 h-3.5 animate-pulse" /> Grading…</>
              : <><Trophy className="w-3.5 h-3.5" /> Grade Answer</>
            }
          </button>
        </div>
      </div>

      {gradeError && (
        <div className="mx-4 mt-3 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-xs text-red-400">
          {gradeError}
        </div>
      )}

      {/* Split layout */}
      <div className="flex gap-0 lg:gap-6 px-0 lg:px-6 py-4 max-w-6xl mx-auto">

        {/* ── Left: sections ── */}
        <div className="flex-1 min-w-0 space-y-4 px-4 lg:px-0 pb-10">

          {/* Question display */}
          <div className={`rounded-2xl border px-5 py-4 ${def.accent}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${def.color}`}>Question</p>
            <p className="text-sm text-white leading-relaxed">{question}</p>
          </div>

          {/* Marking note strip */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/6 border border-amber-500/20 px-4 py-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{def.markingNote}</p>
          </div>

          {/* Each section */}
          {def.sections.map((section, sIdx) => {
            const text = sections[section.key] || "";
            const isFilled = text.trim().length > 10;
            const isLoadingThis = coachingLoading === section.key;
            const isActive = activeSection === section.key;
            const sectionCoaching = coaching[section.key];

            return (
              <div
                key={section.key}
                className={[
                  "rounded-2xl border transition-all",
                  isActive
                    ? `${def.accent} border-opacity-100`
                    : "border-[var(--border)] bg-[var(--bg-card)]",
                ].join(" ")}
              >
                {/* Header */}
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center gap-2.5">
                    {isFilled ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className={`w-5 h-5 rounded-full border-2 text-[10px] font-bold flex items-center justify-center shrink-0 ${def.color} border-current opacity-50`}>
                        {sIdx + 1}
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-white">{section.label}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-dim)] ml-7 mt-0.5">{section.criteria}</p>
                </div>

                {/* Textarea */}
                <div className="px-5 pb-3">
                  <textarea
                    value={text}
                    onChange={e => updateSection(section.key, e.target.value)}
                    onFocus={() => setActiveSection(section.key)}
                    rows={section.rows || 4}
                    placeholder={`Write your ${section.label.toLowerCase()} here...`}
                    className={[
                      "w-full bg-[#0d0d16] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] text-sm leading-relaxed outline-none resize-none placeholder:text-[var(--text-dim)] transition-colors font-mono",
                      "focus:border-[var(--em)]",
                    ].join(" ")}
                  />

                  {/* Coach button row */}
                  <div className="flex items-center justify-end mt-2">
                    {text.trim().length > 15 && (
                      <button
                        onClick={() => coachSection(section.key)}
                        disabled={isLoadingThis}
                        className="flex items-center gap-1.5 text-xs text-[var(--em)] hover:opacity-80 transition-opacity disabled:opacity-50 border border-[var(--border-em)]/40 hover:border-[var(--border-em)] px-3 py-1.5 rounded-lg"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        {isLoadingThis ? "Coaching…" : "Coach this step"}
                      </button>
                    )}
                  </div>

                  {/* Inline AI coaching feedback */}
                  {sectionCoaching && (
                    <div className="mt-3 rounded-xl bg-[var(--em)]/6 border border-[var(--em)]/20 px-4 py-3 space-y-1.5">
                      <p className="text-[10px] font-bold text-[var(--em)] uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-3 h-3" /> AI Coach
                      </p>
                      <p className="text-xs text-[var(--text)] leading-relaxed whitespace-pre-wrap">{sectionCoaching}</p>
                    </div>
                  )}

                  {/* Tips accordion */}
                  <TipBox tip={section.tip} />
                </div>
              </div>
            );
          })}

          {/* Bottom grade button */}
          <button
            onClick={gradeAnswer}
            disabled={grading || filledCount === 0}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[var(--em)] text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {grading
              ? <><Zap className="w-4 h-4 animate-pulse" /> Grading your answer…</>
              : <><Trophy className="w-4 h-4" /> Grade My Full Answer</>
            }
          </button>
        </div>

        {/* ── Right: sticky panel (desktop) ── */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-20 space-y-4">

            {/* Progress */}
            <div className="glass rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">Progress</h3>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-muted)]">Steps filled</span>
                  <span className={`font-bold ${def.color}`}>{filledCount}/{def.sections.length}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${def.color.replace("text-", "bg-")}`}
                    style={{ width: `${def.sections.length > 0 ? (filledCount / def.sections.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Format summary */}
            <div className="glass rounded-2xl p-4 space-y-2">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${def.color}`}>
                <Icon className="w-3.5 h-3.5" /> Required Format
              </h3>
              <div className="space-y-1.5">
                {def.sections.map((s, i) => (
                  <div key={s.key} className="flex items-start gap-2">
                    {(sections[s.key] || "").trim().length > 10
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      : <div className="w-3.5 h-3.5 rounded-full border border-[var(--border)] shrink-0 mt-0.5" />
                    }
                    <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active section coaching */}
            {activeSection && coaching[activeSection] && (
              <div className="glass rounded-2xl p-4 space-y-2">
                <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${def.color}`}>
                  <Zap className="w-3.5 h-3.5" /> AI Coach
                </h3>
                <p className="text-xs text-[var(--text)] leading-relaxed whitespace-pre-wrap">
                  {coaching[activeSection]}
                </p>
              </div>
            )}

            {/* Critical rules */}
            <div className="glass rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Common Mark Losses
              </h3>
              <ul className="space-y-1.5">
                {(
                  answerType.startsWith("physics") ? [
                    "No formula stated (loses method mark)",
                    "Missing units in final answer (−1)",
                    "Skipping substitution step",
                    "Rounding too early (−1)",
                  ] : answerType.startsWith("chemistry") && answerType.includes("equation") ? [
                    "Unbalanced equation (major loss)",
                    "Missing state symbols per compound",
                    "No conditions above arrow",
                    "Wrong formulae for common compounds",
                  ] : answerType === "chemistry_practical" ? [
                    "Imprecise language ('stuff' not 'precipitate')",
                    "Skipping inference after observation",
                    "Conclusion not supported by all tests",
                  ] : answerType === "biology_comparison" ? [
                    "No table format (−1 mark auto)",
                    "Using common names not scientific",
                    "Fewer than 5 comparison points",
                  ] : answerType.startsWith("biology") ? [
                    "No definition at start",
                    "Common names not scientific names",
                    "Vague mechanism (no steps)",
                    "No specific example",
                  ] : answerType.startsWith("mathematics") ? [
                    "No formula stated",
                    "Missing units (−1)",
                    "Premature rounding (−1)",
                    "Skipping working steps",
                  ] : answerType === "economics_theory" ? [
                    "No definition of key term",
                    "Missing diagram (up to −8 marks)",
                    "Unlabeled diagram axes",
                    "Points listed without explanation",
                    "No real-world example",
                  ] : answerType.startsWith("accounting") ? [
                    "Wrong DR/CR side classification",
                    "Missing folio column",
                    "No 'Balance c/d' / 'Balance b/d'",
                    "Trial balance totals not equal",
                  ] : [
                    "No definition in introduction",
                    "Points listed without explanation",
                    "No West African examples",
                    "No conclusion paragraph",
                  ]
                ).map((m, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--text-muted)]">
                    <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
