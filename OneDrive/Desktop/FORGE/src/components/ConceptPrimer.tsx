"use client";

import { Lightbulb } from "lucide-react";
import ForgeMarkdown from "@/components/ForgeMarkdown";

interface Props {
 primer: string;
 imageUrl?: string;
}

export default function ConceptPrimer({ primer, imageUrl }: Props) {
 return (
 <div style={{
 marginBottom: "1.5rem",
 borderRadius: 12,
 overflow: "hidden",
 background: "linear-gradient(180deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))",
 border: "1px solid rgba(212,175,55,0.25)",
 }}>
 {imageUrl && (
 <div style={{
 width: "100%",
 aspectRatio: "16 / 9",
 maxHeight: 320,
 background: `url(${imageUrl}) center/cover, #1a1410`,
 borderBottom: "1px solid rgba(212,175,55,0.18)",
 }} />
 )}
 <div style={{ padding: "1.25rem 1.375rem 1.375rem" }}>
 <div style={{
 display: "inline-flex",
 alignItems: "center",
 gap: "0.4rem",
 fontFamily: "var(--font-mono)",
 fontSize: "0.625rem",
 letterSpacing: "0.28em",
 color: "var(--accent)",
 textTransform: "uppercase",
 marginBottom: "0.75rem",
 }}>
 <Lightbulb size={11} /> Concept primer
 </div>
 <ForgeMarkdown>{primer}</ForgeMarkdown>
 </div>
 </div>
 );
}
