"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LogOut, BookOpen, Sparkles } from "lucide-react"

export function Navbar() {
    const { user, logout } = useAuthStore()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    return (
        <nav className="border-b border-[#1e1e2e] bg-[#0d0d14]/80 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-violet-500/20 p-1.5 rounded-lg group-hover:bg-violet-500/30 transition-colors flex items-center justify-center">
                                <Image src="/icon.svg" alt="NeuroTron Logo" width={20} height={20} />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">NeuroTron</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <>
                                <div className="text-sm font-medium text-gray-300">
                                    {user.name}
                                    <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full ml-2">
                                        {user.role}
                                    </span>
                                </div>
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
