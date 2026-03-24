"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Image as ImageIcon, Type, BarChart, HelpCircle, Terminal, Code, AlignLeft } from "lucide-react"
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

// Dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false, loading: () => <div className="h-32 bg-gray-50 rounded-md border animate-pulse" /> })

function EditorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const subjectId = searchParams?.get('subjectId')
    const lessonId = searchParams?.get('lessonId')

    const [title, setTitle] = useState("")
    const [blocks, setBlocks] = useState<any[]>([])
    const [loading, setLoading] = useState(!!lessonId)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (lessonId) {
            api.get(`/lessons/${lessonId}`).then(res => {
                setTitle(res.data.title)
                setBlocks(res.data.blocks.map((b: any) => ({ ...b, id: b.id || Math.random().toString() })))
                setLoading(false)
            })
        }
    }, [lessonId])

    const handleSave = async () => {
        if (!title) return alert('Title is required')
        setSaving(true)

        // Clean blocks for API
        const cleanBlocks = blocks.map((b, idx) => ({
            type: b.type,
            content: b.content,
            order: idx
        }))

        try {
            if (lessonId) {
                await api.put(`/lessons/${lessonId}`, { title, blocks: cleanBlocks })
            } else {
                await api.post(`/lessons`, { title, subjectId: parseInt(subjectId as string), blocks: cleanBlocks })
            }
            router.push(`/admin/subjects/${subjectId}`)
        } catch (err) {
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

        setBlocks([...blocks, newBlock])
    }

    const updateBlock = (id: string, newContent: any) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content: newContent } : b))
    }

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id))
    }

    const moveBlock = (id: string, direction: -1 | 1) => {
        const idx = blocks.findIndex(b => b.id === id)
        if ((direction === -1 && idx === 0) || (direction === 1 && idx === blocks.length - 1)) return

        const newBlocks = [...blocks]
        const temp = newBlocks[idx]
        newBlocks[idx] = newBlocks[idx + direction]
        newBlocks[idx + direction] = temp
        setBlocks(newBlocks)
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading editor...</div>

    // React Quill toolbar config
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'clean']
        ]
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-32">
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
                    <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Lesson'}
                </Button>
            </div>

            <div className="space-y-4">
                {blocks.map((block, idx) => (
                    <Card key={block.id} className="relative group border-gray-200">
                        <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => moveBlock(block.id, -1)}><ArrowLeft className="w-4 h-4 rotate-90" /></Button>
                            <div className="h-8 w-8 flex items-center justify-center text-gray-300"><GripVertical className="w-4 h-4" /></div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => moveBlock(block.id, 1)}><ArrowLeft className="w-4 h-4 -rotate-90" /></Button>
                        </div>

                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="px-2 py-1 bg-gray-100 text-[11px] font-bold text-gray-600 uppercase rounded tracking-wider">
                                    {block.type.replace('-', ' ')}
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Advanced Toggle */}
                                    <label className="flex items-center gap-2 cursor-pointer group/toggle">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only"
                                                checked={!!block.content.isAdvanced}
                                                onChange={(e) => updateBlock(block.id, { ...block.content, isAdvanced: e.target.checked })}
                                            />
                                            <div className={`w-8 h-4 rounded-full transition-colors ${block.content.isAdvanced ? 'bg-violet-500' : 'bg-gray-300'}`}></div>
                                            <div className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${block.content.isAdvanced ? 'translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-600 group-hover/toggle:text-gray-900">Advanced Content</span>
                                    </label>
                                    <div className="h-4 w-px bg-gray-200" />
                                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 -my-2" onClick={() => removeBlock(block.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {block.type === 'paragraph' && (
                                <div className="prose-editor">
                                    <ReactQuill 
                                        theme="snow" 
                                        value={block.content.text} 
                                        onChange={(val) => updateBlock(block.id, { ...block.content, text: val })}
                                        modules={quillModules}
                                        className="bg-white"
                                    />
                                </div>
                            )}

                            {block.type === 'image' && (
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Image URL"
                                        value={block.content.url}
                                        onChange={e => updateBlock(block.id, { ...block.content, url: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Alt text (optional)"
                                        value={block.content.alt}
                                        onChange={e => updateBlock(block.id, { ...block.content, alt: e.target.value })}
                                    />
                                    {block.content.url && (
                                        <div className="mt-4 border rounded-md p-2 bg-gray-50 flex justify-center">
                                            <img src={block.content.url} alt="Preview" className="max-h-48 object-contain" onError={(e: any) => e.target.style.display = 'none'} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {block.type === 'code' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-gray-500" />
                                        <select 
                                            value={block.content.language || 'javascript'}
                                            onChange={e => updateBlock(block.id, { ...block.content, language: e.target.value })}
                                            className="text-sm border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500"
                                        >
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="typescript">TypeScript</option>
                                            <option value="html">HTML</option>
                                            <option value="css">CSS</option>
                                            <option value="cpp">C++</option>
                                            <option value="java">Java</option>
                                        </select>
                                    </div>
                                    <textarea
                                        className="w-full h-48 p-4 text-gray-200 bg-[#1e1e1e] font-mono text-sm border-none rounded-md focus:ring-2 focus:ring-violet-500 resize-y"
                                        placeholder={`Enter ${block.content.language || 'code'} here...`}
                                        value={block.content.code || ''}
                                        spellCheck="false"
                                        onChange={e => updateBlock(block.id, { ...block.content, code: e.target.value })}
                                    />
                                </div>
                            )}

                            {block.type === 'code-execution' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Terminal className="w-4 h-4" /> Default Code Wrapper
                                    </div>
                                    <textarea
                                        className="w-full h-48 p-3 text-gray-200 bg-[#12121a] font-mono border border-[#1e1e2e] rounded-md focus:ring-green-500 focus:border-green-500 resize-y"
                                        placeholder="Enter the default JavaScript code here..."
                                        value={block.content.code}
                                        spellCheck="false"
                                        onChange={e => updateBlock(block.id, { ...block.content, code: e.target.value })}
                                    />
                                </div>
                            )}

                            {block.type === 'html-sandbox' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <Code className="w-4 h-4" /> HTML/JS/CSS Visualization Default Code
                                    </div>
                                    <textarea
                                        className="w-full h-64 p-3 text-gray-200 bg-[#12121a] font-mono border border-[#1e1e2e] rounded-md focus:ring-purple-500 focus:border-purple-500 resize-y"
                                        placeholder="Enter the default HTML code here..."
                                        value={block.content.html}
                                        spellCheck="false"
                                        onChange={e => updateBlock(block.id, { ...block.content, html: e.target.value })}
                                    />
                                </div>
                            )}

                            {block.type === 'quiz' && (
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Question text..."
                                        value={block.content.question}
                                        onChange={e => updateBlock(block.id, { ...block.content, question: e.target.value })}
                                        className="font-medium"
                                    />
                                    <div className="space-y-2 pl-4 border-l-2 border-gray-200 ml-2">
                                        {block.content.options.map((opt: string, optIdx: number) => (
                                            <div key={optIdx} className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name={`correct-${block.id}`}
                                                    checked={block.content.correctIndex === optIdx}
                                                    onChange={() => updateBlock(block.id, { ...block.content, correctIndex: optIdx })}
                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                />
                                                <Input
                                                    placeholder={`Option ${optIdx + 1}`}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...block.content.options]
                                                        newOpts[optIdx] = e.target.value
                                                        updateBlock(block.id, { ...block.content, options: newOpts })
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                <div className="pt-6 flex justify-center">
                    <div className="bg-white border shadow-sm rounded-full p-1.5 flex gap-1 flex-wrap justify-center">
                        <Button variant="ghost" size="sm" className="rounded-full text-gray-600" onClick={() => addBlock('paragraph')}>
                            <AlignLeft className="w-4 h-4 mr-2" /> Text (Rich)
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-gray-600" onClick={() => addBlock('code')}>
                            <Code className="w-4 h-4 mr-2" /> Code Snippet
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-gray-600" onClick={() => addBlock('image')}>
                            <ImageIcon className="w-4 h-4 mr-2" /> Image
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-gray-600" onClick={() => addBlock('code-execution')}>
                            <Terminal className="w-4 h-4 mr-2" /> JS Sandbox
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-gray-600" onClick={() => addBlock('html-sandbox')}>
                            <Code className="w-4 h-4 mr-2" /> HTML Visualizer
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-gray-600" onClick={() => addBlock('quiz')}>
                            <HelpCircle className="w-4 h-4 mr-2" /> Mini Quiz
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default function LessonEditorPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading editor...</div>}>
            <EditorContent />
        </Suspense>
    )
}
