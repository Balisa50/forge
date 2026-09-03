/**
 * Exam-path route segment.
 *
 * Importing the KaTeX stylesheet here loads it exactly once for every page
 * under /learn/exam (the path landing and each concept page), so the
 * server-rendered math markup from src/lib/math.tsx, and the client-side
 * KaTeX in the mastery quiz, is styled without per-page <link>s.
 */
import "katex/dist/katex.min.css";

export default function ExamLayout({ children }: { children: React.ReactNode }) {
 return children;
}
