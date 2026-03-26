"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { ArrowLeft, Users, BarChart2, Trophy, Activity, Medal } from "lucide-react"

// ── Metric Card ───────────────────────────────────────────────
function MetricCard({ icon, label, value, sub, color }: {
    icon: React.ReactNode
    label: string
    value: string | number
    sub?: string
    color: string
}) {
    return (
        <div className={`rounded-2xl p-5 border bg-gradient-to-br ${color} flex items-start gap-4`}>
            <div className="p-2.5 bg-white/10 rounded-xl">{icon}</div>
            <div>
                <p className="text-sm font-medium text-white/70">{label}</p>
                <p className="text-3xl font-black text-white mt-0.5">{value}</p>
                {sub && <p className="text-xs text-white/50 mt-1">{sub}</p>}
            </div>
        </div>
    )
}

export default function ExamStatsPage() {
    const params = useParams()
    const id = params?.id
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!id) return
        api.get(`/exams/${id}/stats`)
            .then(res => setData(res.data))
            .catch(() => setError("Failed to load stats. You may not have admin access."))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (error || !data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-3">
            <p className="text-red-400 font-medium">{error || "No data available."}</p>
            <Link href="/admin/subjects" className="text-sm text-violet-400 hover:underline">Back to subjects</Link>
        </div>
    )

    const { exam, metrics, attempts } = data

    // Group by user, take best attempt per user
    const userBestMap: Record<number, any> = {}
    for (const attempt of attempts) {
        const uid = attempt.userId
        if (!userBestMap[uid] || (attempt.score ?? 0) > (userBestMap[uid].score ?? 0)) {
            userBestMap[uid] = attempt
        }
    }
    const perUserBest = Object.values(userBestMap).sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0))

    const fmt = (v: number | null) => v != null ? `${Math.round(v * 10) / 10}%` : '—'

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/subjects">
                    <button className="h-9 w-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-gray-300" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-white">{exam.title}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Exam Analytics Dashboard</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={<Users className="w-5 h-5 text-white" />}
                    label="Unique Students"
                    value={metrics.uniqueUsers}
                    sub="took this exam"
                    color="from-blue-600/80 to-blue-700/80 border-blue-500/30"
                />
                <MetricCard
                    icon={<Activity className="w-5 h-5 text-white" />}
                    label="Total Attempts"
                    value={metrics.totalAttempts}
                    sub="including retakes"
                    color="from-violet-600/80 to-violet-700/80 border-violet-500/30"
                />
                <MetricCard
                    icon={<Trophy className="w-5 h-5 text-white" />}
                    label="Best Grade"
                    value={fmt(metrics.bestGrade)}
                    sub="highest score achieved"
                    color="from-amber-600/80 to-amber-700/80 border-amber-500/30"
                />
                <MetricCard
                    icon={<BarChart2 className="w-5 h-5 text-white" />}
                    label="Average Score"
                    value={fmt(metrics.avgGrade)}
                    sub="across all attempts"
                    color="from-emerald-600/80 to-emerald-700/80 border-emerald-500/30"
                />
            </div>

            {/* Per-student leaderboard */}
            <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-amber-400" /> Student Leaderboard
                </h2>
                {perUserBest.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-white/10">
                        No attempts yet. Exams submitted by students will appear here.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d0d14]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3">#</th>
                                    <th className="text-left px-5 py-3">Student</th>
                                    <th className="text-left px-5 py-3">Email</th>
                                    <th className="text-right px-5 py-3">Best Score</th>
                                    <th className="text-right px-5 py-3">Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {perUserBest.map((attempt: any, idx: number) => {
                                    const score = attempt.score ?? null
                                    const scoreColor = score === null ? 'text-gray-500'
                                        : score >= 80 ? 'text-emerald-400'
                                        : score >= 50 ? 'text-amber-400'
                                        : 'text-red-400'
                                    return (
                                        <tr key={attempt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-5 py-3.5 text-gray-500 font-mono">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-white">{attempt.user?.name || '—'}</td>
                                            <td className="px-5 py-3.5 text-gray-400">{attempt.user?.email || '—'}</td>
                                            <td className={`px-5 py-3.5 text-right font-bold text-lg ${scoreColor}`}>
                                                {fmt(score)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-gray-500 text-xs">
                                                {attempt.submittedAt
                                                    ? new Date(attempt.submittedAt).toLocaleString()
                                                    : <span className="italic">In progress</span>}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* All attempts table */}
            {attempts.length > perUserBest.length && (
                <div>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-violet-400" /> All Attempts ({attempts.length})
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d0d14]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="text-left px-5 py-3">Student</th>
                                    <th className="text-right px-5 py-3">Score</th>
                                    <th className="text-right px-5 py-3">Started</th>
                                    <th className="text-right px-5 py-3">Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((attempt: any) => {
                                    const score = attempt.score ?? null
                                    const scoreColor = score === null ? 'text-gray-500'
                                        : score >= 80 ? 'text-emerald-400'
                                        : score >= 50 ? 'text-amber-400'
                                        : 'text-red-400'
                                    return (
                                        <tr key={attempt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="px-5 py-3 font-medium text-white">{attempt.user?.name || '—'}</td>
                                            <td className={`px-5 py-3 text-right font-bold ${scoreColor}`}>{fmt(score)}</td>
                                            <td className="px-5 py-3 text-right text-gray-500 text-xs">{new Date(attempt.startedAt).toLocaleString()}</td>
                                            <td className="px-5 py-3 text-right text-gray-500 text-xs">
                                                {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : <span className="italic">In progress</span>}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
