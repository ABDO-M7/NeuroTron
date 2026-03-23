"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LogOut, User as UserIcon, Bell, X } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"

const NAV_LINKS = [
    { href: "/", label: "Home", authOnly: false },
    { href: "/courses", label: "Courses", authOnly: false },
    { href: "/about", label: "About", authOnly: false },
    { href: "/contact", label: "Contact", authOnly: false },
    { href: "/feedback", label: "Feedback", authOnly: false },
]

// Pages where the Navbar should NOT appear
const HIDDEN_ON = ["/", "/login", "/register", "/complete-profile", "/verify-email"]

export function Navbar() {
    const { user, logout } = useAuthStore()
    const router = useRouter()
    const pathname = usePathname()
    const [notifications, setNotifications] = useState<any[]>([])
    const [showNotif, setShowNotif] = useState(false)
    const [unread, setUnread] = useState(0)

    // Must be called BEFORE any conditional return (React rules of hooks)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get("/notifications")
                setNotifications(res.data || [])
                setUnread(res.data?.filter((n: any) => !n.read).length || 0)
            } catch { /* ignore */ }
        }
        if (user) fetchNotifications()
    }, [user])

    // Hide on landing/auth pages (AFTER all hooks)
    if (HIDDEN_ON.some(p => pathname === p || pathname.startsWith(p + "?"))) return null

    const homeHref = user
        ? user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"
        : "/"

    const resolvedLinks = NAV_LINKS.map(link =>
        link.href === "/" ? { ...link, href: homeHref } : link
    )

    const handleLogout = () => {
        logout()
        router.push("/login")
    }

    const isActive = (href: string) => {
        if (href === homeHref || href === "/") return pathname === href || pathname === "/"
        return pathname.startsWith(href)
    }

    return (
        <>
            {/* Liquid Glass Navbar */}
            <nav className="navbar-glass sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* Logo */}
                        <Link href={homeHref} className="flex items-center gap-2 group flex-shrink-0">
                            <div className="bg-violet-500/20 p-1.5 rounded-lg group-hover:bg-violet-500/30 transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
                                <Image src="/icon.svg" alt="NeuroTron Logo" width={20} height={20} />
                            </div>
                            <Logo className="text-xl tracking-tight text-white" />
                        </Link>

                        {/* Center Nav Links */}
                        <div className="hidden md:flex items-center gap-1">
                            {resolvedLinks.map(link => {
                                const active = isActive(link.href)
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 group
                                            ${active
                                                ? "text-white"
                                                : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        {active && (
                                            <span className="absolute inset-0 rounded-lg bg-violet-500/15 border border-violet-500/30" />
                                        )}
                                        <span className="relative z-10">{link.label}</span>
                                        {/* hover underline animation */}
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-violet-400 rounded-full transition-all duration-300 group-hover:w-4/5 opacity-0 group-hover:opacity-100" />
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {user && (
                                <>
                                    {/* Bell */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowNotif(v => !v)}
                                            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
                                        >
                                            <Bell className="w-4 h-4" />
                                            {unread > 0 && (
                                                <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-[#0d0d14] animate-pulse" />
                                            )}
                                        </button>

                                        {/* Notification Dropdown */}
                                        {showNotif && (
                                            <div className="absolute right-0 top-12 w-80 rounded-2xl border border-white/10 bg-[#0d0d14]/90 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                                    <span className="text-sm font-semibold text-white">Notifications</span>
                                                    <button onClick={() => setShowNotif(false)} className="text-gray-500 hover:text-white transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="max-h-72 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                            No notifications yet
                                                        </div>
                                                    ) : (
                                                        notifications.map((n: any) => (
                                                            <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? 'bg-violet-500/5' : ''}`}>
                                                                <p className="text-sm text-white font-medium">{n.title}</p>
                                                                <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                                                                <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Avatar + Name */}
                                    {user.role === 'STUDENT' ? (
                                        <Link href="/student/profile" className="flex items-center gap-2 group">
                                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center overflow-hidden border border-violet-500/30 group-hover:border-violet-400/60 transition-all duration-200 group-hover:scale-105">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-4 h-4 text-violet-300" />
                                                )}
                                            </div>
                                            <span className="hidden sm:block text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{user.name}</span>
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center overflow-hidden border border-violet-500/30">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-4 h-4 text-violet-300" />
                                                )}
                                            </div>
                                            <span className="hidden sm:block text-sm font-medium text-gray-300">{user.name}</span>
                                        </div>
                                    )}

                                    {/* Logout */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}
