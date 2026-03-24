"use client"

import { useEffect, useState, useRef } from "react"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, User, Pencil } from "lucide-react"
import { useAuthStore } from "@/lib/auth"
import MagicBento from "@/components/magic_bento"

const LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Postgraduate"]

const PREDEFINED_SPECS = [
    "Computing and data science",
    "Cyber security",
    "Intelligent Systems",
    "Business Analytics",
    "Healthcare Informatics"
]

export default function StudentProfile() {
    const { user, login, token } = useAuthStore()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [form, setForm] = useState({ 
        name: "", 
        level: "", 
        specialization: "", 
        avatar: "" 
    })
    const [isSaving, setIsSaving] = useState(false)
    const [isOtherSpec, setIsOtherSpec] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchProfileAndStats = async () => {
            try {
                const [profileRes, statsRes] = await Promise.all([
                    api.get("/users/me"),
                    api.get("/users/me/stats")
                ])
                const profile = profileRes.data
                setForm({
                    name: profile.name || "",
                    level: profile.level || "",
                    specialization: profile.specialization || "",
                    avatar: profile.avatar || ""
                })
                if (profile.specialization && !PREDEFINED_SPECS.includes(profile.specialization)) {
                    setIsOtherSpec(true);
                }
                setStats(statsRes.data)
                
                // update store so navbar avatar refreshes
                if (user && token) {
                    login({ ...user, ...profile }, token)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfileAndStats()
    }, [])

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, avatar: reader.result as string }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const res = await api.patch("/users/me/profile", form)
            if (user && token) {
                login({ ...user, ...res.data }, token)
            }
            setIsEditing(false)
        } catch (err) {
            console.error("Failed to update profile", err)
        } finally {
            setIsSaving(false)
        }
    }

    if (loading) return (
        <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading profile...
        </div>
    )

    // Build 6 learning analytics cards from real stats
    const avg = stats?.averageScore ?? 0
    const total = stats?.totalAttempts ?? 0
    const lessons = stats?.completedLessons ?? 0
    const best = stats?.bestScore ?? (stats?.averageScore ?? 0)
    const streakDays = stats?.streakDays ?? 0

    // Random Quote logic (predictable during session)
    const QUOTES = [
        '"Talk is cheap. Show me the code." — Linus',
        '"First solve the problem, then write the code." — John',
        '"The best way to predict the future is to invent it." — Alan',
        '"Make it work, make it right, make it fast." — Kent',
        '"Simplicity is the soul of efficiency." — Austin'
    ];
    const quote = QUOTES[(user?.id || 0) % QUOTES.length];

    const bentoCards = [
        {
            color: '#060010',
            label: 'Exams Taken',
            title: `${total}`,
            description: total === 0 ? "No exams yet — dive in!" : total === 1 ? "You've started your journey!" : `${total} attempts recorded`,
        },
        {
            color: '#060010',
            label: 'Avg Score',
            title: `${avg.toFixed(1)}%`,
            description: avg >= 80 ? "Outstanding performance!" : avg >= 60 ? "Solid — keep pushing!" : "Room to grow — you've got this!",
        },
        {
            color: '#060010',
            label: 'Lessons Taken',
            title: `${lessons}`,
            description: lessons === 0 ? "Start your first lesson!" : `${lessons} lessons completed so far.`,
        },
        {
            color: '#060010',
            label: 'Best Score',
            title: `${typeof best === 'number' ? best.toFixed(1) : best}%`,
            description: best >= 90 ? "Near perfect — excellent!" : best >= 70 ? "Great personal record!" : "Keep aiming higher!",
        },
        {
            color: '#060010',
            label: 'Tech Quote',
            title: quote.split('»')[0],
            description: "Daily inspiration.",
        },
        {
            color: '#060010',
            label: '🔥 Day Streak',
            title: `${streakDays}`,
            description: streakDays >= 7 ? "A full week of learning!" : streakDays > 0 ? "Keep the streak alive!" : "Start a streak today!",
        },
    ]

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">My Profile</h1>
                <p className="text-gray-400 max-w-lg">Manage your personal details and view real-time progression analytics powered by NeuroTron AI.</p>
            </div>

            {/* Premium Glass Personal Details */}
            <div className="relative group">
                {/* Glow Backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[32px] blur-lg opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                
                <Card className="relative border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-violet-600/20 to-transparent pointer-events-none" />
                    
                    <CardContent className="p-8 sm:p-12 relative z-10 flex flex-col md:flex-row gap-10">
                        {/* Interactive Avatar */}
                        <div className="flex flex-col items-center gap-4 shrink-0">
                            <div className="relative group/avatar">
                                <div className="w-36 h-36 rounded-full border-2 border-white/20 bg-[#1e1e2e] overflow-hidden flex items-center justify-center relative shadow-[0_0_40px_rgba(132,0,255,0.3)] transition-transform duration-500 group-hover/avatar:scale-105">
                                    {form.avatar ? (
                                        <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-16 h-16 text-gray-500" />
                                    )}
                                    
                                    {isEditing && (
                                        <div 
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera className="w-8 h-8 text-white mb-2" />
                                            <span className="text-xs font-semibold text-white tracking-widest uppercase">Upload</span>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleAvatarChange} 
                                />
                            </div>
                            
                            {!isEditing && (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all">
                                    <Pencil className="w-3.5 h-3.5 mr-2" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>

                        {/* Modern Form Grid */}
                        <div className="flex-1 w-full flex flex-col justify-center">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Name */}
                                <div className="space-y-2 group/input">
                                    <Label className="text-xs font-semibold uppercase tracking-widest text-violet-400">Full Name</Label>
                                    {isEditing ? (
                                        <Input 
                                            value={form.name} 
                                            onChange={(e) => setForm({...form, name: e.target.value})} 
                                            className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus-visible:ring-violet-500" 
                                        />
                                    ) : (
                                        <div className="text-xl font-medium text-white group-hover/input:text-violet-200 transition-colors">{form.name || "—"}</div>
                                    )}
                                </div>
                                
                                {/* Level */}
                                <div className="space-y-2 group/input">
                                    <Label className="text-xs font-semibold uppercase tracking-widest text-violet-400">Academic Level</Label>
                                    {isEditing ? (
                                        <select
                                            value={form.level}
                                            onChange={e => setForm({ ...form, level: e.target.value })}
                                            className="w-full px-4 h-12 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                        >
                                            <option value="" className="bg-gray-900">Select year...</option>
                                            {LEVELS.map(l => <option key={l} value={l} className="bg-gray-900">{l}</option>)}
                                        </select>
                                    ) : (
                                        <div className="text-xl font-medium text-white group-hover/input:text-violet-200 transition-colors">{form.level || "—"}</div>
                                    )}
                                </div>

                                {/* Specialization */}
                                <div className="space-y-2 md:col-span-2 group/input">
                                    <Label className="text-xs font-semibold uppercase tracking-widest text-violet-400">Specialization / Track</Label>
                                    {isEditing ? (
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <select
                                                value={isOtherSpec ? "Other" : form.specialization}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === "Other") {
                                                        setIsOtherSpec(true);
                                                        setForm({ ...form, specialization: "" });
                                                    } else {
                                                        setIsOtherSpec(false);
                                                        setForm({ ...form, specialization: val });
                                                    }
                                                }}
                                                className="flex-1 px-4 h-12 rounded-xl border border-white/10 bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                                            >
                                                <option value="" disabled className="bg-gray-900">Select specialization...</option>
                                                {PREDEFINED_SPECS.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                                                <option value="Other" className="bg-gray-900">Other (Enter custom)</option>
                                            </select>
                                            
                                            {isOtherSpec && (
                                                <Input 
                                                    placeholder="E.g. Quantum Computing"
                                                    value={form.specialization} 
                                                    onChange={(e) => setForm({...form, specialization: e.target.value})} 
                                                    className="flex-1 bg-black/40 border-white/10 text-white h-12 rounded-xl focus-visible:ring-violet-500" 
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xl font-medium text-white group-hover/input:text-violet-200 transition-colors">{form.specialization || "—"}</div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Save Actions */}
                            {isEditing && (
                                <div className="flex gap-4 justify-end mt-8 border-t border-white/10 pt-6">
                                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl text-gray-400 hover:text-white">Cancel</Button>
                                    <Button onClick={handleSave} disabled={isSaving} className="bg-white text-black hover:bg-gray-200 rounded-xl px-8 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all">
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Centered Learning Progress */}
            <div className="pt-8 flex flex-col items-center">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white mb-3">Learning Progress</h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">Your academic analytics displayed through our interactive MagicBento dashboard.</p>
                </div>
                
                <div className="w-full flex justify-center">
                    <MagicBento
                        cardData={bentoCards}
                        enableStars={true}
                        enableSpotlight={true}
                        enableBorderGlow={true}
                        clickEffect={true}
                        enableMagnetism={true}
                        glowColor="132, 0, 255"
                        spotlightRadius={400}
                        particleCount={15}
                    />
                </div>
            </div>
        </div>
    )
}
