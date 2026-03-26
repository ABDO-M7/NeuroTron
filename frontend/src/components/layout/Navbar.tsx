"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LogOut, User as UserIcon, Bell, X, Menu } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

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
    const [hoveredPath, setHoveredPath] = useState<string | null>(null)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Scroll state for navbar transform
    const [scrolled, setScrolled] = useState(false)

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false) }, [pathname])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

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

    useEffect(() => {
        const syncProfile = async () => {
            if (!user) return
            try {
                const res = await api.get("/users/me")
                const { login, token } = useAuthStore.getState()
                if (token) login({ ...user, ...res.data }, token)
            } catch { /* silent */ }
        }
        syncProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
        <>
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <motion.nav
                    className="pointer-events-auto w-full flex items-center gap-4 transition-all"
                    animate={scrolled ? { paddingTop: "0px", paddingBottom: "0px" } : { paddingTop: "16px", paddingBottom: "0px" }}
                >
                    <AnimatePresence mode="wait">
                        {!scrolled ? (
                            // BEFORE SCROLL: floating layout
                            <motion.div
                                key="floating"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                                className="w-full max-w-7xl mx-auto px-4 flex items-center h-16 gap-4"
                            >
                                {/* Logo (Left) */}
                                <div className="flex-1 flex justify-start pl-2">
                                    <Link href={homeHref} className="flex items-center gap-2.5 group w-fit">
                                        <div className="transition-transform duration-300 group-hover:scale-110 flex items-center justify-center p-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 shadow-lg">
                                            <Image src="/logo.svg" alt="NeuroTron Logo" width={22} height={22} priority unoptimized />
                                        </div>
                                        <Logo className="text-xl tracking-tight text-white hidden sm:block drop-shadow-md" />
                                    </Link>
                                </div>

                                {/* Centre links pill — hidden on mobile */}
                                <div className="hidden md:flex flex-[2] items-center justify-center">
                                    <div
                                        className="flex items-center gap-1 relative rounded-full border border-white/10 bg-[#070712b3] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)_inset] p-1.5"
                                        onMouseLeave={() => setHoveredPath(null)}
                                    >
                                        {resolvedLinks.map(link => {
                                            const active = isActive(link.href)
                                            const isHovered = hoveredPath === link.href
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onMouseEnter={() => setHoveredPath(link.href)}
                                                    className={`relative px-4 py-1.5 text-sm font-medium transition-colors duration-200 z-10 ${active || isHovered ? "text-white" : "text-gray-400"}`}
                                                >
                                                    {isHovered && (
                                                        <motion.div layoutId="navbar-hover-bg" className="absolute inset-0 rounded-full bg-white/10 shadow-inner shadow-white/5 border border-white/10" initial={false} transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }} />
                                                    )}
                                                    <span className="relative z-20">{link.label}</span>
                                                    {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] z-20" />}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Right actions */}
                                <div className="flex-1 flex justify-end items-center gap-2">
                                    <RightActions user={user} unread={unread} showNotif={showNotif} setShowNotif={setShowNotif} notifications={notifications} handleLogout={handleLogout} homeHref={homeHref} />
                                    {/* Mobile hamburger */}
                                    <button
                                        className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-gray-300 bg-black/20 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-all"
                                        onClick={() => setMobileOpen(v => !v)}
                                        aria-label="Toggle menu"
                                    >
                                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            // AFTER SCROLL: frosted sticky bar
                            <motion.div
                                key="sticky"
                                initial={{ opacity: 0, y: -24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -24 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full max-w-7xl mx-auto px-4"
                            >
                                <div className="bg-[#04040a]/80 backdrop-blur-3xl shadow-[0_8px_60px_rgba(0,0,0,0.8)] border border-white/[0.06] rounded-full mt-2 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/80 to-transparent" />
                                    <div className="px-4 md:px-6 h-[60px] flex items-center gap-4 md:gap-6">

                                        {/* Logo - left */}
                                        <Link href={homeHref} className="flex items-center gap-2.5 group shrink-0">
                                            <div className="relative">
                                                <div className="absolute inset-0 rounded-lg bg-violet-500/30 blur-md group-hover:blur-lg transition-all duration-300" />
                                                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/80 to-indigo-600/80 flex items-center justify-center border border-violet-500/30 shadow-inner">
                                                    <Image src="/logo.svg" alt="NeuroTron" width={16} height={16} priority unoptimized />
                                                </div>
                                            </div>
                                            <Logo className="text-base tracking-tight text-white hidden sm:block font-semibold" />
                                        </Link>

                                        {/* Divider */}
                                        <div className="h-5 w-px bg-white/10 shrink-0 hidden md:block" />

                                        {/* Links - center (hidden on mobile) */}
                                        <div
                                            className="hidden md:flex items-center gap-1 flex-1 justify-center"
                                            onMouseLeave={() => setHoveredPath(null)}
                                        >
                                            {resolvedLinks.map(link => {
                                                const active = isActive(link.href)
                                                const isHovered = hoveredPath === link.href
                                                return (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        onMouseEnter={() => setHoveredPath(link.href)}
                                                        className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 z-10 ${
                                                            active ? "text-white" : isHovered ? "text-white" : "text-gray-400 hover:text-gray-200"
                                                        }`}
                                                    >
                                                        {(isHovered || active) && (
                                                            <motion.div
                                                                layoutId="navbar-hover-bg-sticky"
                                                                className={`absolute inset-0 rounded-full ${
                                                                    active
                                                                        ? "bg-violet-600/20 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.2)]" 
                                                                        : "bg-white/6 border border-white/10"
                                                                }`}
                                                                initial={false}
                                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                            />
                                                        )}
                                                        <span className="relative z-20">{link.label}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>

                                        {/* Right actions */}
                                        <div className="ml-auto shrink-0 flex items-center gap-2">
                                            <RightActions user={user} unread={unread} showNotif={showNotif} setShowNotif={setShowNotif} notifications={notifications} handleLogout={handleLogout} homeHref={homeHref} />
                                            {/* Mobile hamburger */}
                                            <button
                                                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                                                onClick={() => setMobileOpen(v => !v)}
                                                aria-label="Toggle menu"
                                            >
                                                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.nav>
            </div>

            {/* ── Mobile Drawer ──────────────────────────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        {/* Drawer */}
                        <motion.div
                            key="drawer"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 bottom-0 w-72 z-50 bg-[#080810] border-l border-white/10 shadow-2xl flex flex-col md:hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <Image src="/logo.svg" alt="NeuroTron" width={20} height={20} unoptimized />
                                    <Logo className="text-lg text-white" />
                                </div>
                                <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Navigation links */}
                            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                                {resolvedLinks.map(link => {
                                    const active = isActive(link.href)
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                                active
                                                    ? "bg-violet-600/20 text-white border border-violet-500/30"
                                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                                            }`}
                                        >
                                            {link.label}
                                            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
                                        </Link>
                                    )
                                })}
                            </nav>

                            {/* Footer actions */}
                            <div className="p-4 border-t border-white/10 space-y-3">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
                                            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-black/20 flex items-center justify-center shrink-0">
                                                {user.avatar
                                                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                                    : <UserIcon className="w-4 h-4 text-violet-300" />}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                                        <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl">Sign In</Button>
                                    </Link>
                                )}
                                <p className="text-center text-xs text-gray-600 pb-1">NeuroTron — Beta v0.1</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

// Extracted right-side action buttons
function RightActions({ user, unread, showNotif, setShowNotif, notifications, handleLogout, homeHref }: any) {
    return (
        <div className="flex-shrink-0 flex items-center gap-2 md:gap-3">
            {user ? (
                <>
                    {/* Bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotif((v: boolean) => !v)}
                            className="relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white bg-black/20 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-200"
                        >
                            <Bell className="w-4 h-4 md:w-5 md:h-5" />
                            {unread > 0 && (
                                <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-violet-500 rounded-full ring-2 ring-[#070712] animate-pulse" />
                            )}
                        </button>

                        {showNotif && (
                            <div className="absolute right-0 top-14 w-72 md:w-80 rounded-2xl border border-white/10 bg-[#0d0d14]/95 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
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
                                        <div key={n.id} className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.read ? "bg-violet-500/10" : ""}`}>
                                            <p className="text-sm text-white font-medium">{n.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                                            <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Avatar — hidden on mobile (shown in drawer instead) */}
                    {user.role === "STUDENT" ? (
                        <Link href="/student/profile" className="hidden sm:flex items-center gap-2 group">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/10 shadow-lg group-hover:border-violet-400/80 transition-all duration-200 group-hover:scale-105 bg-black/20 backdrop-blur-md flex items-center justify-center">
                                {user.avatar
                                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    : <UserIcon className="w-4 h-4 text-violet-300" />}
                            </div>
                        </Link>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border border-white/10 shadow-lg bg-black/20 backdrop-blur-md flex items-center justify-center">
                                {user.avatar
                                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    : <UserIcon className="w-4 h-4 text-violet-300" />}
                            </div>
                        </div>
                    )}

                    {/* Logout — hidden on mobile (shown in drawer instead) */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="hidden sm:flex w-9 h-9 md:w-10 md:h-10 p-0 rounded-full text-gray-400 bg-black/20 backdrop-blur-md border border-white/10 shadow-lg hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </>
            ) : (
                <Link href="/login" className="hidden sm:block">
                    <Button size="sm" className="rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg text-sm px-4 md:px-5 h-9 md:h-10 transition-all duration-200">
                        Sign In
                    </Button>
                </Link>
            )}
        </div>
    )
}
