"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BookOpen, Award, Clock } from "lucide-react"

export default function StudentDashboard() {
    const [subjects, setSubjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await api.get("/subjects")
                setSubjects(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchSubjects()
    }, [])

    if (loading) return (
        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading dashboard...
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Student Dashboard</h1>
                <p className="text-gray-400 mt-2">Welcome back! Check out the available subjects below to continue your journey.</p>
            </div>

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-4">Available Subjects</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {subjects.map((subject) => (
                        <Link key={subject.id} href={`/student/subjects/${subject.id}`}>
                            <Card className="hover:border-green-500/30 hover:shadow-green-500/5 hover:shadow-xl transition-all cursor-pointer h-full flex flex-col group border-[#1e1e2e] bg-[#12121a]/80 backdrop-blur-xl">
                                <div
                                    className="h-32 w-full bg-cover bg-center rounded-t-xl relative overflow-hidden"
                                    style={{ backgroundImage: `url(${subject.imageUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'})` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] to-transparent" />
                                </div>
                                <CardHeader>
                                    <CardTitle className="group-hover:text-green-400 transition-colors text-white">{subject.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-gray-400">{subject.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto pt-0 text-sm text-gray-500 flex gap-4">
                                    <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {subject._count?.lessons || 0} Lessons</span>
                                    <span className="flex items-center gap-1"><Award className="h-4 w-4" /> {subject._count?.exams || 0} Exams</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {subjects.length === 0 && (
                        <div className="col-span-3 text-center p-8 bg-[#12121a] border border-[#1e1e2e] rounded-xl text-gray-500">
                            No subjects available yet. Check back later.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
