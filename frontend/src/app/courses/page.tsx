"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BookOpen, Search } from "lucide-react"

export default function CoursesPage() {
    const [subjects, setSubjects] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await api.get("/subjects")
                setSubjects(res.data || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchSubjects()
    }, [])

    const filtered = subjects.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.description && s.description.toLowerCase().includes(search.toLowerCase())))

    const handleEnroll = async (subjectId: number) => {
        try {
            await api.post(`/subjects/${subjectId}/enroll`)
            router.push(`/student/subjects/${subjectId}`)
        } catch (error) {
            console.error("Failed to enroll", error)
            router.push(`/student/subjects/${subjectId}`) // Redirect anyway
        }
    }

    return (
        <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden pt-12 pb-32">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight text-white">
                        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Courses</span>
                    </h1>
                    <p className="text-xl max-w-2xl mx-auto text-gray-400">
                        Dive into our comprehensive catalog of tech and innovation courses designed to level up your career.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-12 relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input 
                        type="text" 
                        placeholder="Search by course name or description..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-violet-500/50 backdrop-blur-md transition-all shadow-xl"
                    />
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-20 flex justify-center">
                        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        {filtered.map((subject) => (
                            <div
                                key={subject.id}
                                onClick={() => handleEnroll(subject.id)}
                                className="blob-card rounded-2xl cursor-pointer flex flex-col group h-full transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="blob" />
                                <div className="blob-bg rounded-2xl" />
                                <div className="blob-content flex flex-col rounded-2xl overflow-hidden">
                                    <div
                                        className="h-40 w-full bg-cover bg-center relative transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${subject.imageUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800'})` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
                                    </div>
                                    <div className="px-5 pt-4 pb-2 flex-1">
                                        <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors mb-2">{subject.name}</h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{subject.description}</p>
                                    </div>
                                    <div className="px-5 pt-3 pb-5 flex items-center justify-between border-t border-white/5 mt-2">
                                        <div className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" /> Start Learning
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
                                            <svg className="w-4 h-4 text-white translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && filtered.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        No courses found matching "{search}".
                    </div>
                )}
            </div>
        </main>
    )
}
