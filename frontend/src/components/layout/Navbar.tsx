"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LogOut, BookOpen, Sparkles, User as UserIcon } from "lucide-react"
import { Logo } from "@/components/ui/Logo"

export function Navbar() {
    const { user, logout } = useAuthStore()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    return (
        <nav className="border-b border-white/5 bg-[#0d0d14]/40 backdrop-blur-2xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-violet-500/20 p-1.5 rounded-lg group-hover:bg-violet-500/30 transition-colors flex items-center justify-center">
                                <Image src="/icon.svg" alt="NeuroTron Logo" width={20} height={20} />
                            </div>
                            <Logo className="text-xl tracking-tight text-white" />
                        </Link>
                    </div>

                    {/* Main Website Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
                        <Link href="/courses" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Courses</Link>
                        <Link href="/about" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">About</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center overflow-hidden border border-violet-500/30">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-4 h-4 text-violet-300" />
                                        )}
                                    </div>
                                    <div className="hidden sm:block text-sm font-medium text-gray-300">
                                        {user.name}
                                    </div>
                                </div>
                                {user.role === 'STUDENT' && (
                                    <Link href="/student/profile">
                                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            Profile
                                        </Button>
                                    </Link>
                                )}
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-400 hover:text-white">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
