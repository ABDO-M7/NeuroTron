"use client"

import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/ui/Logo"

const features = [
    {
        icon: "🧠",
        title: "AI Grading & Analysis",
        description: "Submit essays for instant Gemini AI feedback. After every exam, get a personalized revision roadmap identifying exactly where to focus next.",
    },
    {
        icon: "🛠️",
        title: "Interactive Learning",
        description: "Engage with dynamic content right inside your lessons — execute live code snippets, solve math problems, and interactive blocks.",
    },
    {
        icon: "📚",
        title: "Block-Based Learning",
        description: "Subjects are organized into rich, interactive blocks — code, math formulas, embedded media, and collapsible sections for distraction-free study.",
    },
    {
        icon: "🔥",
        title: "Streaks & Progress Tracking",
        description: "Build daily learning streaks, watch your course progress update automatically.",
    },
    {
        icon: "📊",
        title: "Exam Performance Analytics",
        description: "After every exam, you can see the Top 3 students on a live in-exam leaderboard.",
    },
    {
        icon: "📝",
        title: "Smart Notes",
        description: "Jot down private study notes in a floating side panel without ever leaving the lesson. Your notes are saved and synced automatically.",
    },
    {
        icon: "🎓",
        title: "Curriculum Organization",
        description: "Courses are organized by tracks, and lessons by topics. students can filter and search by topic.",
    },
    {
        icon: "🔐",
        title: "Secure & Frictionless",
        description: "Instant OAuth sign-in via Google and GitHub. Your data is protected and your learning journey is private and personalized.",
    },
    {
        icon: "📱",
        title: "Any Device, Anywhere",
        description: "Fully responsive — phone, tablet, or desktop. Pick up exactly where you left off, from a distraction-free dark-mode reader.",
    },
]

export default function AboutPage() {
    return (
        <main className="min-h-screen relative overflow-hidden text-white/90">

            {/* ─── Beta Badge ──────────────────────────────────────────────── */}
            <div className="flex justify-center pt-6 px-4 relative z-10">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border"
                    style={{
                        background: "rgba(57,12,237,0.12)",
                        border: "1px solid rgba(139,92,246,0.35)",
                        color: "rgba(196,181,253,0.9)",
                        backdropFilter: "blur(12px)",
                    }}>
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    Beta v0.1 — We&apos;re still building. Expect improvements weekly.
                </span>
            </div>

            {/* ─── Hero ─────────────────────────────────────────────────── */}
            <section className="text-center px-4 py-16 md:py-24 relative z-10">
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[700px] h-[400px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, rgba(57,12,237,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />

                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                        What is{" "}
                        <Logo glow />?
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: "rgba(247,235,249,0.75)" }}>
                        <Logo /> is a next-generation EdTech platform combining structured courses, rich interactive lessons, and cutting-edge AI — helping students study smarter, not harder.
                    </p>
                    <p className="text-sm md:text-base max-w-xl mx-auto" style={{ color: "rgba(247,235,249,0.5)" }}>
                        Built for ambitious students who want real results — not just passive watching.
                    </p>
                </div>
            </section>

            {/* ─── How it works ─────────────────────────────────────────── */}
            <section className="px-4 py-12 md:py-16 max-w-5xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12" style={{ color: "#f7ebf9" }}>
                    How It Works
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    {[
                        { step: "01", title: "Sign Up Free", desc: "Login instantly with your Google or GitHub account — no passwords, no friction." },
                        { step: "02", title: "Explore & Learn", desc: "Browse courses organized by tracks and topics. Read block-based lessons in a distraction-free dark reader." },
                        { step: "03", title: "Test & Grow", desc: "Take timed exams with image-based questions, get AI-graded essay feedback, and track your progress automatically." },
                    ].map(({ step, title, desc }) => (
                        <div
                            key={step}
                            className="p-5 md:p-6 rounded-2xl relative overflow-hidden"
                            style={{
                                background: "rgba(57,12,237,0.07)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                backdropFilter: "blur(20px)",
                            }}
                        >
                            <div className="text-4xl md:text-5xl font-black mb-4 opacity-20" style={{ color: "#390ced" }}>{step}</div>
                            <h3 className="text-base md:text-lg font-bold mb-2" style={{ color: "#f7ebf9" }}>{title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: "rgba(247,235,249,0.6)" }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Features ─────────────────────────────────────────────── */}
            <section className="px-4 py-12 md:py-16 max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12" style={{ color: "#f7ebf9" }}>
                    Everything you need to excel
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="p-5 md:p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300"
                            style={{
                                background: "rgba(103,43,115,0.08)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                backdropFilter: "blur(16px)",
                            }}
                        >
                            <div className="text-2xl md:text-3xl mb-3">{f.icon}</div>
                            <h3 className="font-bold text-sm md:text-base mb-2" style={{ color: "#f7ebf9" }}>{f.title}</h3>
                            <p className="text-xs md:text-sm leading-relaxed" style={{ color: "rgba(247,235,249,0.55)" }}>{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Stats ────────────────────────────────────────────────── */}
            <section className="px-4 py-12 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { value: "9+", label: "Core Features" },
                        { value: "3", label: "Question Types" },
                        { value: "AI", label: "Powered Grading" },
                        { value: "β", label: "Beta — Growing Fast" },
                    ].map(item => (
                        <div key={item.label} className="text-center p-4 rounded-2xl" style={{ background: "rgba(57,12,237,0.06)", border: "1px solid rgba(255,255,255,0.07)" }}>
                            <p className="text-3xl md:text-4xl font-black text-violet-300 mb-1">{item.value}</p>
                            <p className="text-xs text-gray-500">{item.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── CTA ──────────────────────────────────────────────────── */}
            <section className="text-center py-16 md:py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(57,12,237,0.15), transparent)" }} />
                <div className="relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6" style={{ color: "#f7ebf9" }}>Ready to level up?</h2>
                    <p className="text-base md:text-lg mb-8" style={{ color: "rgba(247,235,249,0.6)" }}>
                        Join the growing family of <Logo />.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 rounded-2xl text-sm md:text-base font-bold transition-all duration-300"
                        style={{
                            background: "rgba(57,12,237,0.3)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            color: "#f7ebf9",
                            boxShadow: "0 0 40px rgba(57,12,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                        }}
                    >
                        Start Learning Free
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>

            {/* ─── Footer ───────────────────────────────────────────────── */}
            <footer className="text-center py-6 md:py-8 border-t text-xs md:text-sm" style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(247,235,249,0.3)" }}>
                © 2026 <Logo /> — Beta v0.1 · Built with ❤️ for ambitious learners
            </footer>
        </main>
    )
}
