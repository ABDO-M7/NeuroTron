"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Save, Plus, Trash2, BrainCircuit, CheckSquare, ListFilter, Image as ImageIcon, Eye } from "lucide-react"

function ExamEditorContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const subjectId = searchParams?.get('subjectId')
    const examId = searchParams?.get('examId')

    const [title, setTitle] = useState("")
    const [duration, setDuration] = useState(30)
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(!!examId)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (examId) {
            api.get(`/exams/${examId}`).then(res => {
                setTitle(res.data.title)
                setDuration(res.data.duration)
                setQuestions(res.data.questions.map((q: any) => ({
                    ...q,
                    id: q.id || Math.random().toString(),
                    options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : ['', '', '', '']
                })))
                setLoading(false)
            })
        }
    }, [examId])

    const handleSave = async () => {
        if (!title) return alert('Title is required')
        setSaving(true)

        // Clean payload
        const cleanQuestions = questions.map((q, idx) => {
            const payload: any = {
                type: q.type,
                text: q.text,
                points: parseInt(q.points) || 1,
                order: idx,
                imageUrl: q.imageUrl || undefined,
                imageDesc: q.imageDesc || undefined,
            }
            if (q.type === 'MCQ') {
                payload.options = q.options
                payload.correctAnswer = q.correctAnswer
            } else if (q.type === 'TRUE_FALSE') {
                payload.correctAnswer = q.correctAnswer
            }
            return payload
        })

        try {
            if (examId) {
                await api.put(`/exams/${examId}`, { title, duration: parseInt(duration.toString()), questions: cleanQuestions })
            } else {
                await api.post(`/exams`, { title, subjectId: parseInt(subjectId as string), duration: parseInt(duration.toString()), questions: cleanQuestions })
            }
            router.push(`/admin/subjects/${subjectId}`)
        } catch (err) {
            alert("Failed to save exam")
            setSaving(false)
        }
    }

    const addQuestion = (type: string) => {
        const base = { id: Math.random().toString(), type, text: '', points: 5, imageUrl: '', imageDesc: '' }
        if (type === 'MCQ') setQuestions([...questions, { ...base, options: ['', '', '', ''], correctAnswer: '' }])
        if (type === 'TRUE_FALSE') setQuestions([...questions, { ...base, correctAnswer: 'true' }])
        if (type === 'ESSAY') setQuestions([...questions, { ...base, points: 20 }])
    }

    const updateQ = (id: string, field: string, val: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: val } : q))
    }

    const removeQ = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id))
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading editor...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/subjects/${subjectId}`}>
                        <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
                    </Link>
                    <div className="space-y-1">
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Exam Title"
                            className="text-2xl font-bold h-10 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent w-[400px]"
                        />
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            Duration:
                            <Input
                                type="number"
                                value={duration}
                                onChange={e => setDuration(parseInt(e.target.value) || 0)}
                                className="w-20 h-7 text-sm px-2"
                            />
                            minutes
                        </div>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Exam'}
                </Button>
            </div>

            <div className="space-y-6 mt-8">
                {questions.map((q, idx) => (
                    <Card key={q.id} className="border-gray-200">
                        <CardHeader className="bg-gray-50 border-b p-4 flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-400">Q{idx + 1}</span>
                                <span className="px-2 py-1 bg-white border text-xs font-semibold text-gray-600 rounded flex items-center gap-1.5">
                                    {q.type === 'MCQ' && <ListFilter className="w-3 h-3" />}
                                    {q.type === 'TRUE_FALSE' && <CheckSquare className="w-3 h-3" />}
                                    {q.type === 'ESSAY' && <BrainCircuit className="w-3 h-3 text-indigo-500" />}
                                    {q.type.replace('_', ' ')}
                                </span>
                                {q.type === 'ESSAY' && <span className="text-xs text-indigo-600 font-medium ml-2">Applies AI Auto-Grading</span>}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    Points:
                                    <Input
                                        type="number"
                                        value={q.points}
                                        onChange={e => updateQ(q.id, 'points', e.target.value)}
                                        className="w-16 h-7 text-sm px-2 bg-white"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeQ(q.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5">
                            <textarea
                                className="w-full min-h-[80px] p-3 mb-4 text-gray-900 bg-white border rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y font-medium text-lg"
                                placeholder="Enter question text here..."
                                value={q.text}
                                onChange={e => updateQ(q.id, 'text', e.target.value)}
                            />

                            {q.type === 'MCQ' && (
                                <div className="space-y-3 pl-4 border-l-2 border-gray-100 ml-2">
                                    <div className="text-sm font-medium text-gray-500 mb-2">Provide options and select the correct answer:</div>
                                    {q.options.map((opt: string, optIdx: number) => (
                                        <div key={optIdx} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name={`correct-${q.id}`}
                                                checked={q.correctAnswer === opt}
                                                onChange={() => updateQ(q.id, 'correctAnswer', opt)}
                                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                disabled={!opt}
                                            />
                                            <Input
                                                placeholder={`Option ${optIdx + 1}`}
                                                value={opt}
                                                onChange={e => {
                                                    const newOpts = [...q.options]
                                                    newOpts[optIdx] = e.target.value
                                                    updateQ(q.id, 'options', newOpts)
                                                    if (q.correctAnswer === q.options[optIdx]) {
                                                        updateQ(q.id, 'correctAnswer', e.target.value) // keep sync
                                                    }
                                                }}
                                                className={q.correctAnswer === opt && opt ? 'border-green-300 bg-green-50' : ''}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {q.type === 'TRUE_FALSE' && (
                                <div className="flex gap-4">
                                    <div
                                        className={`flex-1 p-3 border rounded-lg cursor-pointer flex items-center gap-3 ${q.correctAnswer === 'true' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                        onClick={() => updateQ(q.id, 'correctAnswer', 'true')}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${q.correctAnswer === 'true' ? 'border-blue-600' : 'border-gray-300'}`}>
                                            {q.correctAnswer === 'true' && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                                        </div>
                                        True
                                    </div>
                                    <div
                                        className={`flex-1 p-3 border rounded-lg cursor-pointer flex items-center gap-3 ${q.correctAnswer === 'false' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                        onClick={() => updateQ(q.id, 'correctAnswer', 'false')}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${q.correctAnswer === 'false' ? 'border-blue-600' : 'border-gray-300'}`}>
                                            {q.correctAnswer === 'false' && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                                        </div>
                                        False
                                    </div>
                                </div>
                            )}

                            {q.type === 'ESSAY' && (
                                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-start gap-4">
                                    <BrainCircuit className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-medium text-indigo-900">AI-Graded Essay</h4>
                                        <p className="text-sm text-indigo-700/80 mt-1">Students will be provided a text area. Their response will be automatically assessed by the AI model against the question text, considering accuracy and clarity.</p>
                                    </div>
                                </div>
                            )}

                            {/* ── Image Upload Section (all question types) ── */}
                            <div className="mt-4 p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg space-y-3">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Question Image (Optional)
                                </div>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        value={q.imageUrl || ''}
                                        onChange={e => updateQ(q.id, 'imageUrl', e.target.value)}
                                        placeholder="Paste image URL…"
                                        className="flex-1 h-8 text-sm bg-white"
                                    />
                                    <div className="relative shrink-0">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={e => {
                                                const file = e.target.files?.[0]
                                                if (!file) return
                                                const reader = new FileReader()
                                                reader.onload = () => updateQ(q.id, 'imageUrl', reader.result as string)
                                                reader.readAsDataURL(file)
                                            }}
                                        />
                                        <Button type="button" variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-gray-300">
                                            <ImageIcon className="w-3 h-3" /> Upload
                                        </Button>
                                    </div>
                                </div>
                                {q.imageUrl && (
                                    <img src={q.imageUrl} alt="Preview" className="max-h-48 rounded-lg object-contain border border-gray-100 bg-white p-1" />
                                )}
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                                        <Eye className="w-3 h-3 text-amber-500" />
                                        Hidden AI Description <span className="text-gray-400 font-normal">(only sent to Gemini, never shown to students)</span>
                                    </label>
                                    <textarea
                                        value={q.imageDesc || ''}
                                        onChange={e => updateQ(q.id, 'imageDesc', e.target.value)}
                                        rows={2}
                                        placeholder="Describe the image for the AI grader (e.g. 'This is a network diagram with 3 nodes: A, B, C...')"
                                        className="w-full p-2 text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-md focus:ring-amber-400 resize-y outline-none placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <div className="pt-6 flex justify-center">
                    <div className="bg-white border shadow-sm rounded-full p-1.5 flex gap-1">
                        <Button variant="ghost" size="sm" className="rounded-full text-gray-600" onClick={() => addQuestion('MCQ')}>
                            <ListFilter className="w-4 h-4 mr-2" /> Multiple Choice
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-gray-600" onClick={() => addQuestion('TRUE_FALSE')}>
                            <CheckSquare className="w-4 h-4 mr-2" /> True / False
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700" onClick={() => addQuestion('ESSAY')}>
                            <BrainCircuit className="w-4 h-4 mr-2" /> AI Essay
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ExamEditorPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading editor...</div>}>
            <ExamEditorContent />
        </Suspense>
    )
}
