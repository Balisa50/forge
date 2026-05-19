"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Check, X, Flame, Zap, Crown, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    id: "solo",
    name: "Solo",
    Icon: Flame,
    price: "$0",
    period: "forever",
    color: "var(--text-secondary)",
    tagline: "Self-paced learners with no mentor",
    features: [
      { text: "1 self-paced roadmap (no mentor)", included: true },
      { text: "AI Professor interrogation (3 questions per session)", included: true },
      { text: "10 mastery checkpoints per week", included: true },
      { text: "All 9 curated tracks accessible", included: true },
      { text: "Public Wall of Fame eligibility", included: true },
      { text: "Basic analytics", included: true },
      { text: "Personal mentor + week releases", included: false },
      { text: "Verified completion certificate", included: false },
      { text: "Custom roadmap builder", included: false },
    ],
  },
  {
    id: "mentee",
    name: "Mentee",
    Icon: Zap,
    price: "$9",
    period: "/month",
    color: "var(--accent)",
    popular: true,
    tagline: "Paired with a real mentor who controls your pace",
    features: [
      { text: "Everything in Solo", included: true },
      { text: "Paired with a real human mentor", included: true },
      { text: "Mentor-controlled weekly releases with personal notes", included: true },
      { text: "1:1 mentor messaging", included: true },
      { text: "Mentor-authored custom interrogations", included: true },
      { text: "Verified completion certificate (signed by mentor + FORGE)", included: true },
      { text: "Job placement help on graduation", included: true },
      { text: "Priority access to new tracks", included: true },
      { text: "Custom roadmap builder", included: false },
    ],
  },
  {
    id: "mentor",
    name: "Mentor",
    Icon: Crown,
    price: "$19",
    period: "/month",
    color: "var(--purple)",
    tagline: "For working professionals teaching the next generation",
    features: [
      { text: "Unlimited active mentees", included: true },
      { text: "Bulk-release a week to multiple mentees in one click", included: true },
      { text: "Mentor question bank (your interrogation, not the AI's)", included: true },
      { text: "Custom roadmaps (build your own track)", included: true },
      { text: "Branded certificates with your name + your org logo", included: true },
      { text: "Mentor analytics dashboard (cohort-wide progress)", included: true },
      { text: "Discoverable mentor profile in the FORGE marketplace", included: true },
      { text: "First 2 mentees are always free, forever", included: true },
      { text: "Cohort billing (charge your students directly, FORGE takes 10%)", included: true },
    ],
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "rgba(6,6,8,0.9)", backdropFilter: "blur(10px)" }} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <Link href="/" style={{ fontFamily: "var(--font-headline)", color: "var(--accent)", fontSize: "1.375rem", fontWeight: 700, textDecoration: "none" }}>
          The Forge
        </Link>
        {!isLoggedIn && (
          <div className="flex items-center gap-4">
            <Link href="/login" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>Sign In</Link>
            <Link href="/register" className="forge-btn forge-btn-primary">Start Free</Link>
          </div>
        )}
      </nav>

      <section className="pt-32 pb-20 px-6 text-center">
        {isLoggedIn && (
          <div style={{ maxWidth: "1100px", margin: "0 auto 1rem", textAlign: "left" }}>
            <Link href="/dashboard/settings" style={{ color: "var(--text-dim)", display: "inline-flex", alignItems: "center", gap: "0.375rem", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
            >
              <ArrowLeft size={14} /> Back
            </Link>
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: "var(--font-headline)", fontSize: "clamp(2.5rem, 8vw, 4.5rem)", fontWeight: 700, marginBottom: "1rem" }}>
            Simple <span style={{ color: "var(--accent)" }}>Pricing</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.0625rem", maxWidth: "520px", margin: "0 auto 2.5rem" }}>
            Start free. Upgrade when you need AI roadmap generation, certificates, or team features.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span style={{ color: !annual ? "var(--text-primary)" : "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              style={{
                width: "48px", height: "24px", borderRadius: "12px",
                background: annual ? "var(--accent)" : "var(--border)",
                position: "relative", cursor: "pointer", border: "none", transition: "background 0.2s",
              }}
            >
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%", background: "var(--text-primary)",
                position: "absolute", top: "3px", left: annual ? "27px" : "3px", transition: "left 0.2s",
              }} />
            </button>
            <span style={{ color: annual ? "var(--text-primary)" : "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.8125rem" }}>
              Annual <span style={{ color: "var(--green)", fontSize: "0.6875rem" }}>Save 20%</span>
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => {
              const monthlyPrice = parseInt(plan.price.replace("$", "")) || 0;
              const displayPrice = annual && monthlyPrice > 0
                ? `$${Math.round(monthlyPrice * 0.8)}`
                : plan.price;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="forge-panel"
                  style={{
                    padding: "2rem",
                    position: "relative",
                    borderColor: plan.popular ? "var(--accent)" : "var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                  }}
                >
                  {plan.popular && (
                    <div style={{
                      position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                      background: "var(--accent)", color: "#000", fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem", fontWeight: 700, padding: "0.25rem 1rem", borderRadius: "12px",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>
                      Most Popular
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "14px",
                      background: `${plan.color}12`,
                      border: `1px solid ${plan.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "1.25rem",
                    }}>
                      <plan.Icon size={26} strokeWidth={1.5} style={{ color: plan.color }} />
                    </div>
                    <h3 style={{ fontFamily: "var(--font-headline)", fontSize: "1.5rem", marginBottom: "0.5rem" }}>{plan.name}</h3>
                    <div style={{ marginBottom: "1.5rem" }}>
                      <span style={{ fontFamily: "var(--font-headline)", fontSize: "3rem", color: plan.color }}>{displayPrice}</span>
                      <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>{plan.period}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "2rem", textAlign: "left" }}>
                    {plan.features.map((f) => (
                      <div key={f.text} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.875rem" }}>
                        {f.included
                          ? <Check size={14} strokeWidth={2.5} style={{ color: "var(--green)", flexShrink: 0 }} />
                          : <X size={14} strokeWidth={2} style={{ color: "var(--text-dim)", flexShrink: 0 }} />}
                        <span style={{ color: f.included ? "var(--text-secondary)" : "var(--text-dim)" }}>{f.text}</span>
                      </div>
                    ))}
                  </div>

                  {plan.id === "free" ? (
                    <Link
                      href="/register"
                      className="forge-btn forge-btn-ghost"
                      style={{ width: "100%", display: "block", textAlign: "center", padding: "0.75rem" }}
                    >
                      Get Started
                    </Link>
                  ) : (
                    <button
                      onClick={async () => {
                        const planKey = `${plan.id}_${annual ? "annual" : "monthly"}`;
                        const res = await fetch("/api/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ plan: planKey }),
                        });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                        else if (data.error?.includes("Unauthorized")) window.location.href = "/register";
                        else alert(data.error || "Something went wrong");
                      }}
                      className={plan.popular ? "forge-btn forge-btn-primary" : "forge-btn forge-btn-ghost"}
                      style={{ width: "100%", padding: "0.75rem", cursor: "pointer" }}
                    >
                      Upgrade to {plan.name}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem", textAlign: "center", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
        THE FORGE · Built by Abdoulie Balisa, The Gambia &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
