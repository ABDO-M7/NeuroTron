"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Trash2, GripVertical, Image as ImageIcon, HelpCircle, Terminal, Code, AlignLeft, EyeOff, Play } from "lucide-react"
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// ── Dynamic imports ──────────────────────────────────────────────────────────
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <div className="h-36 bg-[#1a1a2e] rounded-lg border border-white/10 animate-pulse" />
})

const SyntaxHighlighter = dynamic(
    () => import("react-syntax-highlighter").then(mod => mod.Prism as any),
    { ssr: false, loading: () => <pre className="bg-[#1e1e1e] p-4 rounded-lg animate-pulse h-24" /> }
)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { vscDarkPlus } = require("react-syntax-highlighter/dist/cjs/styles/prism")

// ── Dark Quill CSS ────────────────────────────────────────────────────────────
const QUILL_DARK_CSS = `
.quill-dark .ql-toolbar { background:#1a1a2e; border-color:rgba(255,255,255,.1)!important; border-radius:8px 8px 0 0; }
.quill-dark .ql-toolbar button,.quill-dark .ql-toolbar .ql-picker-label { color:#9ca3af!important; filter:brightness(2); }
.quill-dark .ql-toolbar button:hover,.quill-dark .ql-toolbar .ql-picker-label:hover { color:#fff!important; }
.quill-dark .ql-container { background:#0f0f1a; border-color:rgba(255,255,255,.1)!important; border-radius:0 0 8px 8px; min-height:140px; }
.quill-dark .ql-editor { color:#e2e8f0; font-size:1rem; line-height:1.75; }
.quill-dark .ql-editor.ql-blank::before { color:#4b5563; font-style:italic; }
.quill-dark .ql-editor h1,.quill-dark .ql-editor h2,.quill-dark .ql-editor h3 { color:#f1f5f9; }
.quill-dark .ql-editor strong { color:#fff; }
.quill-dark .ql-editor a { color:#60a5fa; }
.quill-dark .ql-picker-options { background:#1e1e2e!important; border-color:rgba(255,255,255,.1)!important; }
.quill-dark .ql-picker-item { color:#9ca3af!important; }
`

// ── Inline Block Preview (mirrors student view) ───────────────────────────────
function BlockPreview({ block }: { block: any }) {
    const { type, content } = block

    if (type === 'paragraph') {
        return (
            <div
                className="prose prose-invert max-w-none text-gray-200 leading-relaxed p-1
                    [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl
                    [&_strong]:text-white [&_em]:text-gray-300
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{
                    __html: content.text || '<span style="color:#6b7280;font-style:italic">Empty paragraph — click Edit to write something.</span>'
                }}
            />
        )
    }

    if (type === 'image') {
        return content.url
            ? <img src={content.url} alt={content.alt || ''} className="max-h-64 rounded-lg object-contain"
                onError={(e: any) => { e.target.style.display = 'none' }} />
            : <p className="text-gray-500 italic text-sm">No image URL set yet.</p>
    }

    if (type === 'code') {
        return (
            <div className="rounded-xl overflow-hidden border border-white/10">
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
                    customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85rem', background: '#1e1e1e' }}
                    showLineNumbers
                >
                    {content.code || '// empty'}
                </SyntaxHighlighter>
            </div>
        )
    }

    if (type === 'quiz') {
        return (
            <div className="space-y-2 p-1">
                <p className="font-semibold text-gray-100 text-sm">{content.question || 'No question written yet.'}</p>
                {(content.options || []).map((opt: string, i: number) => (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border text-sm
                        ${i === content.correctIndex
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                            : 'border-white/10 text-gray-400'}`}>
                        <span className="w-5 h-5 shrink-0 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                            {String.fromCharCode(65 + i)}
                        </span>
                        {opt || <span className="italic opacity-40">empty option</span>}
                        {i === content.correctIndex && <span className="ml-auto text-xs font-bold text-emerald-400">✓ correct</span>}
                    </div>
                ))}
            </div>
        )
    }

    return <p className="text-gray-500 italic text-sm">{type} — preview shown for students only.</p>
}

// ── Main Editor ───────────────────────────────────────────────────────────────
function EditorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const subjectId = searchParams?.get('subjectId')
    const lessonId = searchParams?.get('lessonId')

    const [title, setTitle] = useState("")
    const [blocks, setBlocks] = useState<any[]>([])
    const [loading, setLoading] = useState(!!lessonId)
    const [saving, setSaving] = useState(false)
    const [previewSet, setPreviewSet] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (lessonId) {
            api.get(`/lessons/${lessonId}`).then(res => {
                setTitle(res.data.title)
                setBlocks(res.data.blocks.map((b: any) => ({ ...b, id: b.id?.toString() || Math.random().toString() })))
                setLoading(false)
            })
        }
    }, [lessonId])

    const togglePreview = (id: string) =>
        setPreviewSet(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

    const handleSave = async () => {
        if (!title) return alert('Title is required')
        setSaving(true)
        const cleanBlocks = blocks.map((b, idx) => ({ type: b.type, content: b.content, order: idx }))
        try {
            lessonId
                ? await api.put(`/lessons/${lessonId}`, { title, blocks: cleanBlocks })
                : await api.post(`/lessons`, { title, subjectId: parseInt(subjectId as string), blocks: cleanBlocks })
            router.push(`/admin/subjects/${subjectId}`)
        } catch {
            alert("Failed to save lesson")
            setSaving(false)
        }
    }

    const addBlock = (type: string) => {
        const newBlock: any = { id: Math.random().toString(), type, content: { isAdvanced: false } }
        if (type === 'paragraph') newBlock.content = { text: '', isAdvanced: false }
        if (type === 'image') newBlock.content = { url: '', alt: '', isAdvanced: false }
        if (type === 'code') newBlock.content = { code: '', language: 'javascript', isAdvanced: false }
        if (type === 'code-execution') newBlock.content = { code: 'console.log("Hello, World!");', isAdvanced: false }
        if (type === 'html-sandbox') newBlock.content = { html: '<h1>Hello World</h1>', isAdvanced: false }
        if (type === 'quiz') newBlock.content = { question: '', options: ['', '', '', ''], correctIndex: 0, isAdvanced: false }
        setBlocks(prev => [...prev, newBlock])
    }

    const updateBlock = (id: string, newContent: any) =>
        setBlocks(b => b.map(x => x.id === id ? { ...x, content: newContent } : x))

    const removeBlock = (id: string) =>
        setBlocks(b => b.filter(x => x.id !== id))

    const moveBlock = (id: string, dir: -1 | 1) => {
        const idx = blocks.findIndex(b => b.id === id)
        if ((dir === -1 && idx === 0) || (dir === 1 && idx === blocks.length - 1)) return
        const nb = [...blocks];
        [nb[idx], nb[idx + dir]] = [nb[idx + dir], nb[idx]]
        setBlocks(nb)
    }

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            ['link', 'clean']
        ]
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading editor...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-32">
            <style dangerouslySetInnerHTML={{ __html: QUILL_DARK_CSS }} />

            {/* Top bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/subjects/${subjectId}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                    </Link>
                    <Input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Lesson Title"
                        className="text-2xl font-bold h-12 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent w-[400px]"
                    />
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Lesson'}
                </Button>
            </div>

            {/* Block list */}
            <div className="space-y-3">
                {blocks.map((block) => {
                    const isPreviewing = previewSet.has(block.id)
                    return (
                        <div key={block.id} className="relative group">
                            {/* Move handles */}
                            <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-400" onClick={() => moveBlock(block.id, -1)}>
                                    <ArrowLeft className="w-3 h-3 rotate-90" />
                                </Button>
                                <div className="h-7 w-7 flex items-center justify-center text-gray-600">
                                    <GripVertical className="w-3 h-3" />
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-blue-400" onClick={() => moveBlock(block.id, 1)}>
                                    <ArrowLeft className="w-3 h-3 -rotate-90" />
                                </Button>
                            </div>

                            <Card className={`border transition-all duration-200 ${isPreviewing ? 'border-indigo-500/30 bg-[#0e0e1a]' : 'border-white/10 bg-[#13131f]'}`}>
                                {/* Header bar */}
                                <div className={`flex items-center justify-between px-4 py-2 border-b rounded-t-lg
                                    ${isPreviewing ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-white/5'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            {block.type.replace(/-/g, ' ')}
                                        </span>
                                        {isPreviewing && (
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                                Preview
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Advanced toggle */}
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <div className="relative">
                                                <input type="checkbox" className="sr-only"
                                                    checked={!!block.content.isAdvanced}
                                                    onChange={e => updateBlock(block.id, { ...block.content, isAdvanced: e.target.checked })}
                                                />
                                                <div className={`w-7 h-3.5 rounded-full transition-colors ${block.content.isAdvanced ? 'bg-violet-500' : 'bg-gray-600'}`} />
                                                <div className={`absolute left-0.5 top-0.5 bg-white w-2.5 h-2.5 rounded-full shadow transition-transform ${block.content.isAdvanced ? 'translate-x-3.5' : ''}`} />
                                            </div>
                                            <span className="text-[11px] text-gray-500 select-none">Advanced</span>
                                        </label>
                                        <div className="w-px h-3 bg-white/10" />
                                        {/* Preview / Edit toggle */}
                                        <Button variant="ghost" size="sm"
                                            className={`h-6 px-2 text-[11px] gap-1 ${isPreviewing ? 'text-indigo-300 hover:text-white' : 'text-gray-400 hover:text-white'}`}
                                            onClick={() => togglePreview(block.id)}
                                        >
                                            {isPreviewing ? <><EyeOff className="w-3 h-3" />Edit</> : <><Play className="w-3 h-3" />Preview</>}
                                        </Button>
                                        <div className="w-px h-3 bg-white/10" />
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500/50 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => removeBlock(block.id)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <CardContent className="p-5">
                                    {/* PREVIEW */}
                                    {isPreviewing && (
                                        <div className="min-h-[60px] cursor-pointer" onClick={() => togglePreview(block.id)} title="Click to edit">
                                            <BlockPreview block={block} />
                                        </div>
                                    )}

                                    {/* EDIT */}
                                    {!isPreviewing && (
                                        <>
                                            {block.type === 'paragraph' && (
                                                <ReactQuill
                                                    theme="snow"
                                                    value={block.content.text}
                                                    onChange={val => updateBlock(block.id, { ...block.content, text: val })}
                                                    modules={quillModules}
                                                    className="quill-dark"
                                                />
                                            )}

                                            {block.type === 'image' && (
                                                <div className="space-y-3">
                                                    <Input placeholder="Image URL" value={block.content.url}
                                                        onChange={e => updateBlock(block.id, { ...block.content, url: e.target.value })}
                                                        className="bg-[#0f0f1a] border-white/10 text-gray-200 placeholder:text-gray-600" />
                                                    <Input placeholder="Alt text (optional)" value={block.content.alt}
                                                        onChange={e => updateBlock(block.id, { ...block.content, alt: e.target.value })}
                                                        className="bg-[#0f0f1a] border-white/10 text-gray-200 placeholder:text-gray-600" />
                                                    {block.content.url && (
                                                        <div className="rounded-lg border border-white/10 bg-black/20 flex justify-center p-2">
                                                            <img src={block.content.url} alt="Preview" className="max-h-40 object-contain"
                                                                onError={(e: any) => { e.target.style.display = 'none' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {block.type === 'code' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Code className="w-4 h-4 text-gray-500" />
                                                        <select value={block.content.language || 'javascript'}
                                                            onChange={e => updateBlock(block.id, { ...block.content, language: e.target.value })}
                                                            className="text-sm bg-[#0f0f1a] border border-white/10 text-gray-300 rounded-md px-2 py-1">
                                                            {['javascript', 'python', 'typescript', 'html', 'css', 'cpp', 'java'].map(l => (
                                                                <option key={l} value={l}>{l}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <textarea
                                                        className="w-full h-48 p-4 text-gray-200 bg-[#1e1e1e] font-mono text-sm border border-white/10 rounded-md focus:ring-2 focus:ring-violet-500 resize-y outline-none"
                                                        placeholder={`Enter ${block.content.language || 'code'} here...`}
                                                        value={block.content.code || ''}
                                                        spellCheck="false"
                                                        onChange={e => updateBlock(block.id, { ...block.content, code: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {block.type === 'code-execution' && (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Terminal className="w-3 h-3" /> Default starter code for JS Sandbox</p>
                                                    <textarea
                                                        className="w-full h-44 p-3 text-gray-200 bg-[#12121a] font-mono text-sm border border-[#1e1e2e] rounded-md focus:ring-green-500 resize-y outline-none"
                                                        value={block.content.code}
                                                        spellCheck="false"
                                                        onChange={e => updateBlock(block.id, { ...block.content, code: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {block.type === 'html-sandbox' && (
                                                <div className="space-y-2">
                                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Code className="w-3 h-3" /> Default HTML/CSS/JS for Visualization</p>
                                                    <textarea
                                                        className="w-full h-56 p-3 text-gray-200 bg-[#12121a] font-mono text-sm border border-[#1e1e2e] rounded-md focus:ring-purple-500 resize-y outline-none"
                                                        value={block.content.html}
                                                        spellCheck="false"
                                                        onChange={e => updateBlock(block.id, { ...block.content, html: e.target.value })}
                                                    />
                                                </div>
                                            )}

                                            {block.type === 'quiz' && (
                                                <div className="space-y-4">
                                                    <Input placeholder="Question text..." value={block.content.question}
                                                        onChange={e => updateBlock(block.id, { ...block.content, question: e.target.value })}
                                                        className="font-medium bg-[#0f0f1a] border-white/10 text-gray-200 placeholder:text-gray-600" />
                                                    <div className="space-y-2 pl-4 border-l-2 border-white/10 ml-2">
                                                        {block.content.options.map((opt: string, optIdx: number) => (
                                                            <div key={optIdx} className="flex items-center gap-3">
                                                                <input type="radio" name={`correct-${block.id}`}
                                                                    checked={block.content.correctIndex === optIdx}
                                                                    onChange={() => updateBlock(block.id, { ...block.content, correctIndex: optIdx })}
                                                                    className="w-4 h-4 text-blue-500" />
                                                                <Input placeholder={`Option ${optIdx + 1}`} value={opt}
                                                                    onChange={e => {
                                                                        const opts = [...block.content.options]
                                                                        opts[optIdx] = e.target.value
                                                                        updateBlock(block.id, { ...block.content, options: opts })
                                                                    }}
                                                                    className="bg-[#0f0f1a] border-white/10 text-gray-200 placeholder:text-gray-600" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}

                {/* Add block toolbar */}
                <div className="pt-4 flex justify-center">
                    <div className="bg-[#0f0f1a] border border-white/10 shadow-xl rounded-full px-2 py-1.5 flex gap-0.5 flex-wrap justify-center">
                        {[
                            { type: 'paragraph', icon: <AlignLeft className="w-3.5 h-3.5" />, label: 'Text' },
                            { type: 'code', icon: <Code className="w-3.5 h-3.5" />, label: 'Code' },
                            { type: 'image', icon: <ImageIcon className="w-3.5 h-3.5" />, label: 'Image' },
                            { type: 'code-execution', icon: <Terminal className="w-3.5 h-3.5" />, label: 'JS Sandbox' },
                            { type: 'html-sandbox', icon: <Code className="w-3.5 h-3.5" />, label: 'HTML View' },
                            { type: 'quiz', icon: <HelpCircle className="w-3.5 h-3.5" />, label: 'Quiz' },
                        ].map(({ type, icon, label }) => (
                            <Button key={type} variant="ghost" size="sm"
                                className="rounded-full text-gray-400 hover:text-white hover:bg-white/10 h-7 px-3 text-xs gap-1.5"
                                onClick={() => addBlock(type)}>
                                {icon}{label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LessonEditorPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading editor...</div>}>
            <EditorContent />
        </Suspense>
    )
}
