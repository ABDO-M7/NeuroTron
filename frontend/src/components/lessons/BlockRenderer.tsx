"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LiveCodeBlock } from "./LiveCodeBlock"
import { HtmlSandboxBlock } from "./HtmlSandboxBlock"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

function AdvancedBadge() {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-3
            bg-violet-500/10 text-violet-600 border border-violet-300/30">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Advanced Content
        </div>
    )
}

export function BlockRenderer({ block }: { block: any }) {
    const { type, content } = block
    const isAdvanced = content?.isAdvanced
    const textRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (type === 'paragraph' && textRef.current) {
            import('katex').then((katex) => {
                const formulas = textRef.current!.querySelectorAll('.ql-formula')
                formulas.forEach(el => {
                    const formula = el.getAttribute('data-value')
                    if (formula) {
                        try { katex.default.render(formula, el as HTMLElement, { throwOnError: false }) } catch (e) { }
                    }
                })
            })
        }
    }, [content?.text, type])

    switch (type) {
        case 'paragraph':
            return (
                <div className="my-6">
                    {isAdvanced && <AdvancedBadge />}
                    <div
                        ref={textRef}
                        className="prose prose-blue max-w-none text-gray-700 leading-relaxed text-lg [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl"
                        dangerouslySetInnerHTML={{ __html: content.text }}
                    />
                </div>
            )

        case 'image': {
            const images = Array.isArray(content.images) 
                ? content.images 
                : (content.url ? [{ url: content.url, alt: content.alt || '' }] : []);

            if (images.length === 0) return null;

            return (
                <div className="my-6">
                    {isAdvanced && <AdvancedBadge />}
                    <div className="space-y-6 lg:space-y-8">
                        {images.map((img: any, i: number) => img.url && (
                            <figure key={i} className="rounded-xl overflow-hidden border bg-gray-50 shadow-sm">
                                <img src={img.url} alt={img.alt || 'Lesson visual'} className="w-full max-h-[600px] object-contain bg-white" />
                                {img.alt && <figcaption className="p-3 text-center text-sm text-gray-500 bg-white border-t">{img.alt}</figcaption>}
                            </figure>
                        ))}
                    </div>
                </div>
            )
        }

        case 'code':
            return (
                <div className="my-6">
                    {isAdvanced && <AdvancedBadge />}
                    <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                        {/* Header bar */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
                            <div className="flex gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                            </div>
                            <span className="text-xs text-gray-400 font-mono ml-2">{content.language || 'code'}</span>
                        </div>
                        <SyntaxHighlighter
                            language={content.language || 'javascript'}
                            style={vscDarkPlus}
                            customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.875rem', background: '#1e1e1e' }}
                            showLineNumbers
                        >
                            {content.code || ''}
                        </SyntaxHighlighter>
                    </div>
                </div>
            )

        case 'code-execution':
            return (
                <div className="my-6">
                    {isAdvanced && <AdvancedBadge />}
                    <LiveCodeBlock defaultCode={content.code} />
                </div>
            )

        case 'html-sandbox':
            return (
                <div className="my-6">
                    {isAdvanced && <AdvancedBadge />}
                    <HtmlSandboxBlock defaultHtml={content.html} />
                </div>
            )

        case 'quiz':
            return (
                <div className="my-6">
                    {isAdvanced && <AdvancedBadge />}
                    <MiniQuiz content={content} />
                </div>
            )

        default:
            return <div className="p-4 border border-dashed text-gray-400 bg-gray-50 rounded-lg my-4">Unsupported block type: {type}</div>
    }
}

function MiniQuiz({ content }: { content: any }) {
    const [selected, setSelected] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)

    const isCorrect = selected === content.correctIndex

    return (
        <Card className="my-8 border-blue-100 shadow-sm">
            <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-4 text-gray-900">{content.question}</h4>
                <div className="space-y-2">
                    {content.options.map((opt: string, idx: number) => {
                        let btnClass = "w-full justify-start font-normal text-left h-auto py-3 px-4 border"
                        if (submitted) {
                            if (idx === content.correctIndex) btnClass += " bg-emerald-50 border-emerald-500 text-emerald-900"
                            else if (idx === selected) btnClass += " bg-red-50 border-red-500 text-red-900"
                            else btnClass += " opacity-50"
                        } else {
                            btnClass += selected === idx ? " border-blue-500 bg-blue-50 text-blue-900" : " hover:bg-gray-50"
                        }

                        return (
                            <Button
                                key={idx}
                                variant="outline"
                                className={btnClass}
                                onClick={() => !submitted && setSelected(idx)}
                            >
                                <div className="flex w-full items-center gap-3">
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs ${submitted && idx === content.correctIndex ? 'bg-emerald-500 border-emerald-500 text-white' :
                                        submitted && idx === selected && idx !== content.correctIndex ? 'bg-red-500 border-red-500 text-white' :
                                            selected === idx ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white text-gray-500'
                                        }`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className="whitespace-normal break-words leading-relaxed">{opt}</span>
                                </div>
                            </Button>
                        )
                    })}
                </div>

                {!submitted && (
                    <Button
                        className="mt-6 w-full"
                        disabled={selected === null}
                        onClick={() => setSubmitted(true)}
                    >
                        Check Answer
                    </Button>
                )}

                {submitted && (
                    <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                        <span className="text-2xl">{isCorrect ? '🎉' : '💡'}</span>
                        <div>
                            <p className="font-semibold">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                            <p className="text-sm opacity-90">{isCorrect ? 'Great job, you nailed it.' : 'Review the content above and try again later.'}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
