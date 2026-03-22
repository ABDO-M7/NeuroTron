"use client"

import Link from "next/link"
import Image from "next/image"

const features = [
    {
        icon: "🧠",
        title: "AI-Powered Grading",
        description: "Submit essays and get instant, detailed AI feedback powered by Google Gemini. No more waiting for manual corrections.",
    },
    {
        icon: "📚",
        title: "Structured Subjects",
        description: "Every course is organized into elegant, block-based lessons — text, videos, quizzes — crafted by expert instructors.",
    },
    {
        icon: "⏱️",
        title: "Timed Exams",
        description: "Simulate real exam pressure with our auto-graded timed exams. Get scored immediately after submission.",
    },
    {
        icon: "📊",
        title: "Progress Tracking",
        description: "Monitor your scores, completed lessons, and performance trends across all your subjects in one dashboard.",
    },
    {
        icon: "🚀",
        title: "Any Device",
        description: "Fully responsive design so you can study from your phone, tablet, or desktop — seamlessly.",
    },
    {
        icon: "🔐",
        title: "Secure & Private",
        description: "OAuth login via Google and GitHub. Your data is protected and we never store your passwords.",
    },
]

export default function AboutPage() {
    return (
        <main className="min-h-screen" style={{ background: "#000000", color: "#f7ebf9" }}>
            {/* ─── Navbar ───────────────────────────────────────────────── */}
            <nav className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <Link href="/" className="flex items-center gap-2">
                    <div className="p-2 rounded-xl" style={{ background: "rgba(57,12,237,0.3)", border: "1px solid rgba(57,12,237,0.5)", backdropFilter: "blur(12px)" }}>
                        <Image src="/icon.svg" alt="NeuroTron Logo" width={22} height={22} />
                    </div>
                    <span className="font-bold text-xl tracking-tight" style={{ color: "#f7ebf9" }}>NeuroTron</span>
                </Link>
                <Link
                    href="/login"
                    className="text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-300"
                    style={{
                        background: "rgba(57,12,237,0.25)",
                        border: "1px solid rgba(57,12,237,0.6)",
                        backdropFilter: "blur(16px)",
                        color: "#f7ebf9",
                    }}
                >
                    Get Started →
                </Link>
            </nav>

            {/* ─── Hero ─────────────────────────────────────────────────── */}
            <section className="text-center px-4 py-24 relative overflow-hidden">
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(ellipse, rgba(57,12,237,0.2) 0%, transparent 70%)", filter: "blur(60px)" }} />

                <div className="relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                        What is{" "}
                        <span style={{ color: "#390ced", textShadow: "0 0 40px rgba(57,12,237,0.6)" }}>NeuroTron</span>?
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: "rgba(247,235,249,0.75)" }}>
                        NeuroTron is a next-generation EdTech platform that combines structured learning with cutting-edge AI to help students
                        study smarter, not harder.
                    </p>
                    <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(247,235,249,0.5)" }}>
                        Built for ambitious students who want real results — not just passive watching.
                    </p>
                </div>
            </section>

            {/* ─── How it works ─────────────────────────────────────────── */}
            <section className="px-4 py-16 max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#f7ebf9" }}>
                    How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { step: "01", title: "Sign In", desc: "Login instantly with your Google or GitHub account — no passwords needed." },
                        { step: "02", title: "Pick a Subject", desc: "Browse structured subjects and dive into rich, block-based lessons at your own pace." },
                        { step: "03", title: "Take Exams", desc: "Test your knowledge with timed exams and get AI-graded feedback on your essays instantly." },
                    ].map(({ step, title, desc }) => (
                        <div
                            key={step}
                            className="p-6 rounded-2xl relative overflow-hidden"
                            style={{
                                background: "rgba(57,12,237,0.07)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                backdropFilter: "blur(20px)",
                            }}
                        >
                            <div className="text-5xl font-black mb-4 opacity-20" style={{ color: "#390ced" }}>{step}</div>
                            <h3 className="text-lg font-bold mb-2" style={{ color: "#f7ebf9" }}>{title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: "rgba(247,235,249,0.6)" }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Features ─────────────────────────────────────────────── */}
            <section className="px-4 py-16 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "#f7ebf9" }}>
                    Everything you need to excel
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300"
                            style={{
                                background: "rgba(103,43,115,0.08)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                backdropFilter: "blur(16px)",
                            }}
                        >
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <h3 className="font-bold text-base mb-2" style={{ color: "#f7ebf9" }}>{f.title}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: "rgba(247,235,249,0.55)" }}>{f.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── CTA ──────────────────────────────────────────────────── */}
            <section className="text-center py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(57,12,237,0.15), transparent)" }} />
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: "#f7ebf9" }}>Ready to level up?</h2>
                    <p className="text-lg mb-8" style={{ color: "rgba(247,235,249,0.6)" }}>
                        Join thousands of students already learning on NeuroTron.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold transition-all duration-300"
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
            <footer className="text-center py-8 border-t text-sm" style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(247,235,249,0.3)" }}>
                © 2025 NeuroTron — Built with ❤️ for ambitious learners
            </footer>
        </main>
    )
}
