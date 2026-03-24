"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { BlockRenderer } from "@/components/lessons/BlockRenderer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export default function LessonPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id
    const [lesson, setLesson] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        const fetchLesson = async () => {
            try {
                const res = await api.get(`/lessons/${id}`)
                setLesson(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchLesson()
    }, [id])

    if (loading) return <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        Loading lesson material...
    </div>

    if (!lesson) return <div className="p-8 text-center text-red-500">Lesson not found</div>

    return (
        <div className="max-w-3xl mx-auto pb-24">
            <Link href={`/student/subjects/${lesson.subjectId}`} className="inline-flex items-center text-sm font-medium text-green-400 hover:text-green-300 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to {lesson.subject?.name || 'Subject'}
            </Link>

            <header className="mb-10 border-b pb-6">
                <div className="text-sm font-semibold tracking-wider uppercase text-gray-500 mb-2">Lesson {lesson.order}</div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white">{lesson.title}</h1>
            </header>

            <div className="space-y-4">
                {(() => {
                    if (!lesson.blocks || lesson.blocks.length === 0) {
                        return (
                            <div className="p-8 border-2 border-dashed rounded-xl text-center text-gray-500">
                                This lesson has no content blocks yet.
                            </div>
                        )
                    }

                    const groups: any[] = [];
                    let currentGroup: any = { type: 'root', items: [] };
                    
                    lesson.blocks.forEach((block: any) => {
                        if (block.type === 'section') {
                            if (currentGroup.type !== 'root' || currentGroup.items.length > 0) {
                                groups.push(currentGroup);
                            }
                            currentGroup = { type: 'section', title: block.content.title, items: [] };
                        } else {
                            currentGroup.items.push(block);
                        }
                    });
                    if (currentGroup.items.length > 0 || currentGroup.type === 'section') {
                        groups.push(currentGroup);
                    }

                    return groups.map((group, gIdx) => {
                        if (group.type === 'root') {
                            return (
                                <div key={`root-${gIdx}`} className="space-y-4">
                                    {group.items.map((block: any, idx: number) => <BlockRenderer key={block.id || idx} block={block} />)}
                                </div>
                            )
                        } else {
                            return (
                                <Accordion key={`sec-${gIdx}`} type="single" collapsible className="w-full mb-6 border border-white/10 rounded-xl overflow-hidden bg-[#1e1e2e]/40 shadow-xl backdrop-blur-md">
                                    <AccordionItem value={`item-${gIdx}`} className="border-none">
                                        <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-white/5 data-[state=open]:bg-white/5 transition-colors group">
                                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 group-hover:from-violet-300 group-hover:to-indigo-300">
                                                {group.title || 'Section'}
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 py-4 bg-[#0a0a10]/50 border-t border-white/5">
                                            <div className="space-y-4 pt-2">
                                                {group.items.length > 0 ? (
                                                    group.items.map((block: any, idx: number) => <BlockRenderer key={block.id || idx} block={block} />)
                                                ) : (
                                                    <div className="text-gray-500 italic text-sm">Empty section</div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )
                        }
                    });
                })()}
            </div>

            <div className="mt-16 pt-8 border-t flex items-center justify-between">
                <Button variant="outline" onClick={() => router.push(`/student/subjects/${lesson.subjectId}`)}>
                    Mark as Complete
                    <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                </Button>
                <Link href={`/student/subjects/${lesson.subjectId}`}>
                    <Button>
                        Next Lesson <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </div >
    )
}
