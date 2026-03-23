"use client"

import { useEffect, useState, useRef } from "react"
import { api } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Award, Clock, Camera, User, Pencil } from "lucide-react"
import { useAuthStore } from "@/lib/auth"

const LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Postgraduate"]

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
                setStats(statsRes.data)
                
                // update store if needed
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

    const statCards = [
        { title: "Exams Taken", value: stats?.totalAttempts || 0, icon: Clock, color: "text-green-400", bg: "bg-green-500/10" },
        { title: "Completed", value: stats?.completedAttempts || 0, icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { title: "Average Score", value: `${stats?.averageScore || 0}%`, icon: Award, color: "text-teal-400", bg: "bg-teal-500/10" },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Profile</h1>
                <p className="text-gray-400">Manage your account details and view your progress.</p>
            </div>

            {/* Profile Info Section */}
            <Card className="border-[#1e1e2e] bg-[#12121a]/80 backdrop-blur-xl shrink-0 overflow-hidden relative">
                <div className="absolute top-0 w-full h-24 bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40" />
                <CardContent className="pt-12 relative z-10 px-8 pb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div className="w-32 h-32 rounded-full border-4 border-[#12121a] bg-[#1e1e2e] overflow-hidden flex items-center justify-center relative shadow-xl">
                                {form.avatar ? (
                                    <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-gray-500" />
                                )}
                                
                                {isEditing && (
                                    <div 
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera className="w-6 h-6 text-white" />
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

                        {/* Details */}
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white">{isEditing ? "Edit Profile" : "Personal Details"}</h2>
                                {!isEditing && (
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-violet-500/30 hover:bg-violet-500/10 text-violet-300">
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-400">Full Name</Label>
                                    {isEditing ? (
                                        <Input 
                                            value={form.name} 
                                            onChange={(e) => setForm({...form, name: e.target.value})} 
                                            className="bg-[#1a1a2e] border-[#2a2a3a]" 
                                        />
                                    ) : (
                                        <div className="text-lg font-medium text-white">{form.name || "N/A"}</div>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label className="text-gray-400">Academic Level</Label>
                                    {isEditing ? (
                                        <select
                                            value={form.level}
                                            onChange={e => setForm({ ...form, level: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-[#2a2a3a] bg-[#1a1a2e] text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                        >
                                            <option value="">Select year...</option>
                                            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    ) : (
                                        <div className="text-lg font-medium text-white">{form.level || "N/A"}</div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-400">Specialization</Label>
                                    {isEditing ? (
                                        <Input 
                                            value={form.specialization} 
                                            onChange={(e) => setForm({...form, specialization: e.target.value})} 
                                            className="bg-[#1a1a2e] border-[#2a2a3a]" 
                                        />
                                    ) : (
                                        <div className="text-lg font-medium text-white">{form.specialization || "N/A"}</div>
                                    )}
                                </div>
                            </div>
                            
                            {isEditing && (
                                <div className="flex gap-3 justify-end pt-4">
                                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                    <Button onClick={handleSave} disabled={isSaving} className="bg-violet-600 hover:bg-violet-500 text-white">
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Progress/Stats Dashboard */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-4">Learning Progress</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {statCards.map((stat) => (
                        <Card key={stat.title} className="bg-[#12121a]/80 border-[#1e1e2e] hover:border-violet-500/20 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-gray-400">{stat.title}</CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-white">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
