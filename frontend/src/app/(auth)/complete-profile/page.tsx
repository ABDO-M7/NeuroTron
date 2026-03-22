"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { BookOpen, User, Phone, GraduationCap, Layers } from "lucide-react"

import Image from "next/image"

const LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Postgraduate"]

function CompleteProfileForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login, user, token } = useAuthStore()
    const [form, setForm] = useState({ username: "", phone: "", level: "", specialization: "" })
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // If arriving from OAuth redirect with ?token=xxx, store it first
    useEffect(() => {
        const urlToken = searchParams.get("token")
        if (urlToken) {
            try {
                const payload = JSON.parse(atob(urlToken.split(".")[1]))
                login({
                    id: payload.sub,
                    email: payload.email,
                    name: payload.name || payload.email,
                    role: payload.role,
                    profileComplete: false,
                    emailVerified: payload.emailVerified,
                }, urlToken)
            } catch { }
        }
    }, [searchParams])

    // Redirect if profile already complete
    useEffect(() => {
        if (user?.profileComplete) {
            router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard")
        }
    }, [user])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.level) { setError("Please select your academic level"); return }
        setError("")
        setIsLoading(true)
        try {
            const res = await api.post("/auth/complete-profile", form)
            const { user: updatedUser, accessToken } = res.data
            login(updatedUser, accessToken)
            router.replace(updatedUser.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard")
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] p-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/8 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-2 mb-8 relative">
                <div className="bg-violet-500/20 p-2 rounded-xl flex items-center justify-center">
                    <Image src="/icon.svg" alt="NeuroTron Logo" width={24} height={24} />
                </div>
                <span className="font-bold text-2xl tracking-tight text-white">NeuroTron</span>
            </div>

            <Card className="w-full max-w-md border-[#1e1e2e] bg-[#12121a]/80 backdrop-blur-xl">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-bold text-white">Complete Your Profile</CardTitle>
                    <CardDescription className="text-gray-400">
                        Just a few more details to get you started 🚀
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-2"><User className="h-4 w-4" /> Username</Label>
                            <Input
                                placeholder="e.g. john_doe"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                required minLength={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</Label>
                            <Input
                                placeholder="+20 1234567890"
                                type="tel"
                                value={form.phone}
                                onChange={e => {
                                    // Allow only digits, +, spaces, hyphens, parentheses
                                    const val = e.target.value.replace(/[^\d+\s\-().]/g, "")
                                    setForm({ ...form, phone: val })
                                }}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Academic Year</Label>
                            <select
                                value={form.level}
                                onChange={e => setForm({ ...form, level: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-[#2a2a3a] bg-[#1a1a2e] text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            >
                                <option value="">Select year...</option>
                                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 flex items-center gap-2"><Layers className="h-4 w-4" /> Specialization</Label>
                            <Input
                                placeholder="e.g. Computer Science, Medicine..."
                                value={form.specialization}
                                onChange={e => setForm({ ...form, specialization: e.target.value })}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold mt-2"
                        >
                            {isLoading ? "Saving..." : "Complete Setup →"}
                        </Button>

                        <div className="pt-4 text-center border-t border-white/10 mt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    useAuthStore.getState().logout()
                                    router.push("/login")
                                }}
                                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                Not you? Sign out
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CompleteProfilePage() {
    return (
        <Suspense>
            <CompleteProfileForm />
        </Suspense>
    )
}
