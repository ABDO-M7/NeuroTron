"use client"

import { withAuth } from "@/components/providers"

function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    )
}

export default withAuth(StudentLayout, ['STUDENT'])
