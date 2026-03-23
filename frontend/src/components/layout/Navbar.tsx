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
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/feedback", label: "Feedback" },
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

    // Must be BEFORE any conditional return (React rules of hooks)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get("/notifications")
                setNotifications(res.data || [])
                setUnread(res.data?.filter((n: any) => !n.read).length || 0)
            } catch { /* silent */ }
        }
        if (user) fetchNotifications()
    }, [user])

    // Hide on auth / landing pages
    if (HIDDEN_ON.some(p => pathname === p || pathname.startsWith(p + "?"))) return null

    const homeHref = user
        ? user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"
        : "/"

    const resolvedLinks = NAV_LINKS.map(link =>
        link.href === "/" ? { ...link, href: homeHref } : link
    )

    const handleLogout = () => { logout(); router.push("/login") }

    const isActive = (href: string) =>
        href === homeHref ? pathname === href : pathname.startsWith(href)

    return (
        /* Floating pill wrapper — sits above page content */
        <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <nav className="pointer-events-auto w-full max-w-4xl rounded-full border border-white/10 bg-[#07071280] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)_inset] flex items-center justify-between px-5 h-14 gap-4">

                {/* ── Logo ── */}
                <Link href={homeHref} className="flex items-center gap-2.5 group flex-shrink-0">
                    <div className="bg-violet-500/20 p-1.5 rounded-lg group-hover:bg-violet-500/30 transition-all duration-300 group-hover:scale-110 flex items-center justify-center">
                        <Image src="/icon.svg" alt="NeuroTron Logo" width={18} height={18} />
                    </div>
                    <Logo className="text-lg tracking-tight text-white" />
                </Link>

                {/* ── Centre links ── */}
                <div className="hidden md:flex items-center gap-1">
                    {resolvedLinks.map(link => {
                        const active = isActive(link.href)
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200
                                    ${active
                                        ? "text-white bg-white/10 shadow-inner shadow-white/5"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                                {active && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* ── Right actions ── */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {user ? (
                        <>
                            {/* Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotif(v => !v)}
                                    className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                                >
                                    <Bell className="w-4 h-4" />
                                    {unread > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-[#070712] animate-pulse" />
                                    )}
                                </button>

                                {showNotif && (
                                    <div className="absolute right-0 top-12 w-80 rounded-2xl border border-white/10 bg-[#0d0d14]/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                                            <span className="text-sm font-semibold text-white">Notifications</span>
                                            <button onClick={() => setShowNotif(false)} className="text-gray-500 hover:text-white transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                    No notifications yet
                                                </div>
                                            ) : notifications.map((n: any) => (
                                                <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? "bg-violet-500/5" : ""}`}>
                                                    <p className="text-sm text-white font-medium">{n.title}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                                                    <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Avatar */}
                            {user.role === "STUDENT" ? (
                                <Link href="/student/profile" className="flex items-center gap-2 group">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/15 group-hover:border-violet-400/60 transition-all duration-200 group-hover:scale-105 bg-violet-500/20 flex items-center justify-center">
                                        {user.avatar
                                            ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                            : <UserIcon className="w-4 h-4 text-violet-300" />}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{user.name}</span>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/15 bg-violet-500/20 flex items-center justify-center">
                                        {user.avatar
                                            ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                            : <UserIcon className="w-4 h-4 text-violet-300" />}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-gray-300">{user.name}</span>
                                </div>
                            )}

                            {/* Logout */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="w-9 h-9 p-0 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button size="sm" className="rounded-full bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 h-8 transition-all duration-200">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    )
}
