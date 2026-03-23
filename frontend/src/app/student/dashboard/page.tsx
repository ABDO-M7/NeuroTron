"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BookOpen, Search, PlayCircle } from "lucide-react"

export default function StudentDashboard() {
    const [enrollments, setEnrollments] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const res = await api.get("/users/me/enrollments")
                setEnrollments(res.data || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchEnrollments()
    }, [])

    const filtered = enrollments.filter(e => e.subject?.name.toLowerCase().includes(search.toLowerCase()))

    if (loading) return (
        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading your dashboard...
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Progress</h1>
                    <p className="text-gray-400">Jump back into your active courses.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <input 
                        type="text" 
                        placeholder="Search your courses..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-[#12121a] border border-[#2a2a3a] text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((enr) => (
                    <Link key={enr.id} href={`/student/subjects/${enr.subjectId}`}>
                        <div className="blob-card rounded-2xl cursor-pointer h-full flex flex-col group transition-all duration-300 hover:-translate-y-1">
                            <div className="blob" />
                            <div className="blob-bg rounded-2xl" />
                            <div className="blob-content flex flex-col rounded-2xl overflow-hidden h-full">
                                <div
                                    className="h-32 w-full bg-cover bg-center relative overflow-hidden"
                                    style={{ backgroundImage: `url(${enr.subject.imageUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'})` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14]/90 to-transparent" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                                        <PlayCircle className="w-12 h-12 text-white/80" />
                                    </div>
                                </div>
                                <div className="px-5 pt-4 pb-2 flex-1">
                                    <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors mb-1">{enr.subject.name}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">{enr.subject.description}</p>
                                </div>
                                <div className="px-5 pt-3 pb-5 border-t border-white/5 mt-2">
                                    <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                                        <span>Progress</span>
                                        <span>{enr.progress ? Math.round(enr.progress) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-[#1e1e2e] rounded-full h-1.5 overflow-hidden">
                                        <div 
                                            className="bg-violet-500 h-1.5 rounded-full transition-all duration-1000" 
                                            style={{ width: `${enr.progress || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
                {filtered.length === 0 && search === "" && (
                    <div className="col-span-3 text-center p-12 bg-[#0d0d14]/40 border border-white/5 rounded-2xl backdrop-blur-md">
                        <BookOpen className="w-12 h-12 text-gray-500 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-bold text-white mb-2">No Active Courses</h3>
                        <p className="text-gray-400 mb-6">You haven't started any courses yet. Explore our library to begin learning.</p>
                        <Link href="/courses" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors">
                            Browse Courses
                        </Link>
                    </div>
                )}
                {filtered.length === 0 && search !== "" && (
                    <div className="col-span-3 text-center p-8 text-gray-500">
                        No active courses match your search.
                    </div>
                )}
            </div>
        </div>
    )
}
