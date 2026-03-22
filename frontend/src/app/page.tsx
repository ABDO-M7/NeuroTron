"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"

// Loaded client-side only — WebGL doesn't work on SSR
const LiquidEther = dynamic(() => import("@/components/LiquidEther"), { ssr: false })

export default function HomePage() {
    return (
        <main className="relative min-h-screen bg-black overflow-hidden flex flex-col">
            {/* ─── Full-page fluid WebGL background ─────────────────────── */}
            <div className="absolute inset-0 z-0">
                <LiquidEther
                    colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
                    mouseForce={20}
                    cursorSize={100}
                    isViscous
                    viscous={30}
                    iterationsViscous={32}
                    iterationsPoisson={32}
                    resolution={0.5}
                    isBounce={false}
                    autoDemo
                    autoSpeed={0.5}
                    autoIntensity={2.2}
                    takeoverDuration={0.25}
                    autoResumeDelay={3000}
                    autoRampDuration={0.6}
                />
            </div>

            {/* ─── Subtle overlay to keep text readable ─────────────────── */}
            <div className="absolute inset-0 z-10 bg-black/30" />

            {/* ─── Top navbar ───────────────────────────────────────────── */}
            <nav className="relative z-20 flex items-center justify-between px-8 py-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl"
                        style={{ background: "rgba(57,12,237,0.3)", border: "1px solid rgba(57,12,237,0.5)", backdropFilter: "blur(12px)" }}>
                        <Image src="/icon.svg" alt="NeuroTron Logo" width={24} height={24} />
                    </div>
                    <span className="font-bold text-xl tracking-tight" style={{ color: "#f7ebf9" }}>NeuroTron</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/about"
                        className="text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300"
                        style={{
                            color: "rgba(247,235,249,0.7)",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#f7ebf9")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(247,235,249,0.7)")}
                    >
                        About
                    </Link>
                    <Link
                        href="/login"
                        className="text-sm font-semibold px-5 py-2 rounded-xl transition-all duration-300"
                        style={{
                            background: "rgba(57,12,237,0.25)",
                            border: "1px solid rgba(57,12,237,0.6)",
                            backdropFilter: "blur(16px)",
                            color: "#f7ebf9",
                            boxShadow: "0 0 20px rgba(57,12,237,0.2)",
                        }}
                    >
                        Sign In
                    </Link>
                </div>
            </nav>

            {/* ─── Hero content ─────────────────────────────────────────── */}
            <section className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4">
                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-8"
                    style={{
                        background: "rgba(18,243,51,0.1)",
                        border: "1px solid rgba(18,243,51,0.3)",
                        backdropFilter: "blur(12px)",
                        color: "#12f333",
                    }}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#12f333] animate-pulse inline-block" />
                    AI-Powered EdTech Platform
                </div>

                {/* Main heading */}
                <h1
                    className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-none"
                    style={{
                        color: "#f7ebf9",
                        textShadow: "0 0 80px rgba(82,39,255,0.5), 0 0 20px rgba(177,158,239,0.3)",
                    }}
                >
                    Neuro<span style={{ color: "#390ced", textShadow: "0 0 40px rgba(57,12,237,0.8)" }}>Tron</span>
                </h1>

                {/* Slogan */}
                <p
                    className="text-xl md:text-2xl font-light max-w-2xl mb-4 leading-relaxed"
                    style={{ color: "rgba(247,235,249,0.8)" }}
                >
                    Where intelligence meets education.
                </p>
                <p
                    className="text-base md:text-lg font-light max-w-xl mb-12"
                    style={{ color: "rgba(247,235,249,0.5)" }}
                >
                    Master subjects, ace exams, and get instant AI-powered feedback — all in one place.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Primary — Get Started */}
                    <Link
                        href="/login"
                        className="group relative px-8 py-4 rounded-2xl text-base font-bold transition-all duration-500 overflow-hidden"
                        style={{
                            background: "rgba(57,12,237,0.2)",
                            border: "1px solid rgba(255,255,255,0.25)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            color: "#f7ebf9",
                            boxShadow: "0 8px 32px rgba(57,12,237,0.3), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 0 30px rgba(255,255,255,0.04)",
                        }}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Get Started
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                        {/* Glass shimmer */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)" }}
                        />
                    </Link>

                    {/* Secondary — Learn More */}
                    <Link
                        href="/about"
                        className="group relative px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-500 overflow-hidden"
                        style={{
                            background: "rgba(103,43,115,0.15)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            backdropFilter: "blur(24px)",
                            WebkitBackdropFilter: "blur(24px)",
                            color: "rgba(247,235,249,0.85)",
                            boxShadow: "0 8px 32px rgba(103,43,115,0.2), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 30px rgba(255,255,255,0.03)",
                        }}
                    >
                        <span className="relative z-10">Learn More About Us</span>
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)" }}
                        />
                    </Link>
                </div>

                {/* Stats row */}
                <div className="flex gap-12 mt-20">
                    {[
                        { label: "Subjects", value: "50+" },
                        { label: "Students", value: "10K+" },
                        { label: "Exams Graded", value: "200K+" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-3xl font-black" style={{ color: "#f7ebf9" }}>{stat.value}</div>
                            <div className="text-sm mt-1" style={{ color: "rgba(247,235,249,0.5)" }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── Bottom gradient fade ──────────────────────────────────── */}
            <div className="absolute bottom-0 left-0 right-0 h-32 z-10" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />

            {/* ─── Footer ───────────────────────────────────────────────── */}
            <footer className="relative z-20 text-center py-6 text-xs" style={{ color: "rgba(247,235,249,0.3)" }}>
                © 2025 NeuroTron. All rights reserved.
            </footer>
        </main>
    )
}
