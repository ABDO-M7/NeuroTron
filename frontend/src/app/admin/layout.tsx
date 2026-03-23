"use client"

import { withAuth } from "@/components/providers"
import Link from "next/link"
import { LayoutDashboard, BookOpen, BarChart3 } from "lucide-react"

function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0f] pt-20">
            <div className="max-w-7xl mx-auto flex py-6 sm:px-6 lg:px-8">
                <aside className="w-64 flex-shrink-0 border-r border-[#1e1e2e] pr-6 hidden md:block">
                    <nav className="space-y-1">
                        <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1a1a2e] font-medium text-gray-400 hover:text-green-400 transition-colors">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link href="/admin/subjects" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1a1a2e] font-medium text-gray-400 hover:text-green-400 transition-colors">
                            <BookOpen className="h-4 w-4" />
                            Manage Subjects
                        </Link>
                        <Link href="/admin/results" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1a1a2e] font-medium text-gray-400 hover:text-green-400 transition-colors">
                            <BarChart3 className="h-4 w-4" />
                            Student Results
                        </Link>
                    </nav>
                </aside>
                <main className="flex-1 px-4 sm:px-6 md:px-0 md:pl-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default withAuth(AdminLayout, ['ADMIN'])
