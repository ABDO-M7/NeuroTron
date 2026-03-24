"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Trash2, GripVertical, Image as ImageIcon, HelpCircle, Terminal, Code, AlignLeft, EyeOff, Play, Plus, FolderOpen } from "lucide-react"
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

import 'katex/dist/katex.min.css'

const ReactQuill = dynamic(async () => {
    const { default: RQ, Quill } = await import('react-quill')
    const katexConfig = await import('katex')
    ;(window as any).katex = katexConfig.default

    const Size = Quill.import('attributors/style/size')
    Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']
    Quill.register(Size, true)

    return function Comp({ forwardedRef, ...props }: any) {
        return <RQ ref={forwardedRef} {...props} />
    }
}, {
    ssr: false,
    loading: () => <div className="h-36 bg-[#1a1a2e] rounded-lg border border-white/10 animate-pulse" />
})

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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

    if (type === 'paragraph') {
        return (
            <div
                ref={textRef}
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
        const images = Array.isArray(content.images) 
            ? content.images 
            : (content.url ? [{ url: content.url, alt: content.alt || '' }] : []);
            
        if (images.length === 0) return <p className="text-gray-500 italic text-sm">No images set yet.</p>

        return (
            <div className="flex flex-col gap-4">
                {images.map((img: any, i: number) => img.url && (
                    <img key={i} src={img.url} alt={img.alt || ''} className="max-h-64 rounded-lg object-contain"
                        onError={(e: any) => { e.target.style.display = 'none' }} />
                ))}
            </div>
        )
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

    if (type === 'section') {
        return (
            <div className="w-full mt-4 px-5 py-3 border border-indigo-500/30 rounded-xl bg-indigo-900/10 flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-indigo-400" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                    {content.title || 'Section'}
                </span>
                <span className="ml-auto text-xs text-indigo-400/50 uppercase tracking-widest font-semibold">Group Start</span>
            </div>
        )
    }

    return <p className="text-gray-500 italic text-sm">{type} — preview shown for students only.</p>
}

function RichTextEditor({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const quillRef = useRef<any>(null)
    const [hexColor, setHexColor] = useState('#a855f7')

    const applyColor = () => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor()
            editor.format('color', hexColor)
        }
    }

    const applyBackground = () => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor()
            editor.format('background', hexColor)
        }
    }

    const quillModules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            [{ size: ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ color: [] }, { background: [] }],
            [{ align: [] }],
            ['formula', 'link', 'clean']
        ]
    }

    return (
        <div className="space-y-3">
            <ReactQuill
                forwardedRef={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={quillModules}
                className="quill-dark"
            />
            <div className="flex items-center gap-2 p-2 bg-[#1a1a2e] rounded-md border border-white/10 mt-2">
                <span className="text-xs text-gray-400 font-medium">Custom Color:</span>
                <input 
                    type="color" 
                    value={hexColor} 
                    onChange={e => setHexColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"
                />
                <Input 
                    value={hexColor} 
                    onChange={e => setHexColor(e.target.value)} 
                    placeholder="#HEX" 
                    className="w-24 h-8 text-xs bg-[#0f0f1a] border border-white/10 text-gray-200"
                />
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10" onClick={applyColor}>
                    Apply to Text
                </Button>
                <Button size="sm" variant="secondary" className="h-8 text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10" onClick={applyBackground}>
                    Apply to Highlight
                </Button>
            </div>
        </div>
    )
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
        if (type === 'section') newBlock.content = { title: 'New Layout Section', isAdvanced: false }
        if (type === 'image') newBlock.content = { urls: [], alt: '', isAdvanced: false }
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
                                                <RichTextEditor
                                                    value={block.content.text}
                                                    onChange={val => updateBlock(block.id, { ...block.content, text: val })}
                                                />
                                            )}

                                            {block.type === 'image' && (() => {
                                                const images = Array.isArray(block.content.images) 
                                                    ? block.content.images 
                                                    : (block.content.url ? [{ url: block.content.url, alt: block.content.alt || '' }] : [{ url: '', alt: '' }]);
                                            
                                                const updateImages = (newImages: any[]) => updateBlock(block.id, { ...block.content, images: newImages, url: undefined, alt: undefined });
                                            
                                                return (
                                                    <div className="space-y-4">
                                                        {images.map((img: any, i: number) => (
                                                            <div key={i} className="space-y-3 p-4 border border-white/5 bg-black/10 rounded-xl relative group">
                                                                {images.length > 1 && (
                                                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500/50 hover:text-red-400 opacity-0 group-hover:opacity-100" onClick={() => {
                                                                        const newImgs = [...images];
                                                                        newImgs.splice(i, 1);
                                                                        updateImages(newImgs);
                                                                    }}>
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                )}
                                                                
                                                                <div className="flex gap-2 pr-6">
                                                                    <Input placeholder="Image URL (or upload)" value={img.url}
                                                                        onChange={e => {
                                                                            const newImgs = [...images];
                                                                            newImgs[i].url = e.target.value;
                                                                            updateImages(newImgs);
                                                                        }}
                                                                        className="bg-[#0f0f1a] border-white/10 text-gray-200 placeholder:text-gray-600" />
                                                                    
                                                                    <div className="relative shrink-0">
                                                                        <input 
                                                                            type="file" 
                                                                            accept="image/*" 
                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    const reader = new FileReader();
                                                                                    reader.onload = () => {
                                                                                        const newImgs = [...images];
                                                                                        newImgs[i].url = reader.result;
                                                                                        updateImages(newImgs);
                                                                                    };
                                                                                    reader.readAsDataURL(file);
                                                                                }
                                                                            }}
                                                                        />
                                                                        <Button type="button" variant="secondary" className="bg-[#1a1a2e] hover:bg-[#2a2a4e] text-indigo-300 border border-indigo-500/30">
                                                                            Upload Image
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <Input placeholder="Alt text (optional)" value={img.alt || ''}
                                                                    onChange={e => {
                                                                        const newImgs = [...images];
                                                                        newImgs[i].alt = e.target.value;
                                                                        updateImages(newImgs);
                                                                    }}
                                                                    className="bg-[#0f0f1a] border-white/10 text-gray-200 placeholder:text-gray-600" />
                                                                {img.url && (
                                                                    <div className="rounded-lg border border-white/10 bg-black/20 flex justify-center p-2 mt-2">
                                                                        <img src={img.url} alt="Preview" className="max-h-[300px] object-contain"
                                                                            onError={(e: any) => { e.target.style.display = 'none' }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        
                                                        <Button variant="outline" size="sm" className="w-full border-dashed border-white/20 text-gray-400 hover:text-white bg-transparent" onClick={() => updateImages([...images, { url: '', alt: '' }])}>
                                                            <Plus className="w-4 h-4 mr-2" /> Add Another Image
                                                        </Button>
                                                    </div>
                                                )
                                            })()}

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
                                            {block.type === 'section' && (
                                                <div className="space-y-3 p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-xl">
                                                    <div className="flex items-center gap-2 mb-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                                                        <FolderOpen className="w-4 h-4" />
                                                        Collapsible Section Header
                                                    </div>
                                                    <Input 
                                                        value={block.content.title}
                                                        onChange={e => updateBlock(block.id, { ...block.content, title: e.target.value })}
                                                        className="bg-[#0f0f1a] border-white/10 text-xl font-bold text-gray-200 placeholder:text-gray-600 h-14"
                                                        placeholder="Type section title here..."
                                                    />
                                                    <p className="text-xs text-gray-500">All blocks placed below this section will be grouped inside it.</p>
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
                            { type: 'section', icon: <FolderOpen className="w-3.5 h-3.5" />, label: 'Section' },
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
