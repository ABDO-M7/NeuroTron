"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExamTimer } from "@/components/exams/ExamTimer"
import { ArrowLeft, ArrowRight, Save } from "lucide-react"
import { Label } from "@radix-ui/react-label"

export default function ExamTakingPage() {
    const params = useParams()
    const router = useRouter()
    const id = params?.id
    const [exam, setExam] = useState<any>(null)
    const [attemptId, setAttemptId] = useState<number | null>(null)
    const [currentIdx, setCurrentIdx] = useState(0)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!id) return
        const initExam = async () => {
            try {
                const [examRes, attemptRes] = await Promise.all([
                    api.get(`/exams/${id}/student`),
                    api.post(`/attempts/start/${id}`)
                ])
                setExam(examRes.data)
                setAttemptId(attemptRes.data.id)

                // If there's an existing attempt being resumed, you could load partial answers here

            } catch (err) {
                console.error(err)
                alert('Failed to load exam or exam already submitted.')
                router.back()
            } finally {
                setLoading(false)
            }
        }
        initExam()
    }, [id, router])

    const handleAnswerChange = (val: string) => {
        if (!exam) return
        const qId = exam.questions[currentIdx].id
        setAnswers(prev => ({ ...prev, [qId]: val }))
    }

    const handleSubmit = async () => {
        if (!attemptId || !exam) return
        setSubmitting(true)
        try {
            // Format answers for API
            const answersPayload = Object.keys(answers).map(qId => ({
                questionId: parseInt(qId),
                response: answers[parseInt(qId)]
            }))

            const res = await api.post(`/attempts/${attemptId}/submit`, {
                answers: answersPayload
            })
            router.push(`/student/results/${attemptId}`)
        } catch (err) {
            console.error(err)
            alert('Failed to submit exam. Please try again.')
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading exam environment...</div>
    if (!exam) return null

    const question = exam.questions[currentIdx]
    const isLast = currentIdx === exam.questions.length - 1
    const answeredCount = Object.keys(answers).length
    const totalQuestions = exam.questions.length

    return (
        <div className="max-w-4xl mx-auto pb-24">
            <div className="sticky top-0 z-10 bg-[#0a0a0f] pt-4 pb-4 border-b border-[#1e1e2e] mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">{exam.title}</h1>
                    <div className="text-sm text-muted-foreground mt-1">
                        Question {currentIdx + 1} of {totalQuestions} • {answeredCount} Answered
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <ExamTimer durationMinutes={exam.duration} onTimeUp={handleSubmit} />
                    <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                            if (confirm('Are you sure you want to finish and submit the exam?')) handleSubmit()
                        }}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Finish Exam'}
                    </Button>
                </div>
            </div>

            <Card className="min-h-[400px]">
                <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6 pb-6 border-b">
                        <div className="flex-1">
                            {question.imageUrl && (
                                <div className="mb-5 rounded-xl overflow-hidden border border-[#2a2a3a] bg-[#12121a] flex justify-center p-3">
                                    <img
                                        src={question.imageUrl}
                                        alt="Question visual"
                                        className="max-h-72 object-contain rounded-lg"
                                    />
                                </div>
                            )}
                            <h2 className="text-2xl font-semibold leading-snug">{question.text}</h2>
                        </div>
                        <div className="shrink-0 ml-4 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/20">
                            {question.points} Points
                        </div>
                    </div>

                    <div className="space-y-4">
                        {question.type === 'MCQ' && question.options && (
                            <div className="space-y-3">
                                {(typeof question.options === 'string' ? JSON.parse(question.options) : question.options).map((opt: string, idx: number) => {
                                    const isSelected = answers[question.id] === opt
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleAnswerChange(opt)}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center gap-4 ${isSelected ? 'border-green-500 bg-green-500/10 outline outline-1 outline-green-500 shadow-sm' : 'hover:bg-[#1a1a2e]'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-green-500' : 'border-gray-600'}`}>
                                                {isSelected && <div className="w-3 h-3 bg-green-500 rounded-full" />}
                                            </div>
                                            <span className="text-lg text-gray-200">{opt}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {question.type === 'TRUE_FALSE' && (
                            <div className="flex gap-4">
                                {['True', 'False'].map(opt => {
                                    const val = opt.toLowerCase()
                                    const isSelected = answers[question.id] === val
                                    return (
                                        <Button
                                            key={opt}
                                            variant="outline"
                                            className={`flex-1 h-32 text-2xl ${isSelected ? 'border-green-500 bg-green-500/10 text-green-400 outline outline-2 outline-green-500' : ''}`}
                                            onClick={() => handleAnswerChange(val)}
                                        >
                                            {opt}
                                        </Button>
                                    )
                                })}
                            </div>
                        )}

                        {question.type === 'ESSAY' && (
                            <div className="space-y-3">
                                <Label className="text-sm text-gray-500">Write your essay below. AI will grade your response based on accuracy, clarity, and depth.</Label>
                                <textarea
                                    className="w-full h-64 p-4 border rounded-xl resize-y focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg leading-relaxed bg-[#1a1a2e] border-[#2a2a3a] text-white font-serif"
                                    placeholder="Start typing your answer..."
                                    value={answers[question.id] || ''}
                                    onChange={e => handleAnswerChange(e.target.value)}
                                />
                                <div className="text-right text-sm text-gray-400">
                                    {answers[question.id]?.split(/\s+/).filter(w => w.length > 0).length || 0} words
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="mt-8 flex justify-between items-center bg-[#12121a] p-4 rounded-xl border border-[#1e1e2e] shadow-sm">
                <Button
                    variant="outline"
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    disabled={currentIdx === 0}
                    className="w-32"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                </Button>

                <div className="flex gap-1.5 flex-wrap max-w-md justify-center">
                    {exam.questions.map((q: any, idx: number) => {
                        const hasAns = !!answers[q.id]
                        const isCur = idx === currentIdx
                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIdx(idx)}
                                className={`w-8 h-8 rounded-full text-xs font-medium border flex items-center justify-center transition-colors ${isCur ? 'ring-2 ring-offset-2 ring-green-500 bg-green-600 text-white border-green-600 ring-offset-[#12121a]' :
                                    hasAns ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        'bg-[#1a1a2e] text-gray-500 hover:bg-[#2a2a3a]'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>

                <Button
                    variant={isLast ? "secondary" : "outline"}
                    className="w-32"
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    disabled={isLast}
                >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}
