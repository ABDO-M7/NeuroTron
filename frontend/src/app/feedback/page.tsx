"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ExternalLink, Star } from "lucide-react"

export default function FeedbackPage() {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [message, setMessage] = useState("")
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) return setStatus("error")
        setStatus("submitting")
        try {
            await api.post("/feedback", { message, rating })
            setStatus("success")
            setMessage("")
            setRating(0)
        } catch (error) {
            console.error(error)
            setStatus("error")
        }
    }

    return (
        <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden py-24 flex items-center justify-center">
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-rose-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-xl w-full mx-auto px-4 sm:px-6">
                <Card className="border-white/5 bg-[#0d0d14]/60 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden">
                    <CardHeader className="text-center pb-2 border-b border-white/5 pt-8">
                        <CardTitle className="text-3xl font-black text-white mb-2">Your Feedback</CardTitle>
                        <CardDescription className="text-gray-400">
                            Help us improve NeuroTron. How was your experience?
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-8">
                        {status === "success" ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Thank you!</h3>
                                <p className="text-gray-400">Your feedback has been successfully submitted.</p>
                                <Button className="mt-6 bg-white/5 hover:bg-white/10 text-white" onClick={() => setStatus("idle")}>
                                    Submit Another
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4 text-center">
                                    <Label className="text-gray-300 text-base">Rate your experience</Label>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="focus:outline-none transition-transform hover:scale-110"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                            >
                                                <Star 
                                                    className={`w-10 h-10 transition-colors ${
                                                        star <= (hoverRating || rating) 
                                                            ? "fill-yellow-500 text-yellow-500 shadow-yellow-500/50" 
                                                            : "text-gray-600"
                                                    }`} 
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {status === "error" && rating === 0 && (
                                        <p className="text-red-400 text-sm mt-1">Please select a rating.</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-gray-300">Tell us more (Optional)</Label>
                                    <textarea 
                                        id="message" 
                                        placeholder="What did you like? What could we do better?" 
                                        className="w-full h-32 px-3 py-2 bg-[#12121a] border border-[#2a2a3a] text-white focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/50 rounded-xl resize-none transition-all duration-200"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-6 rounded-xl text-lg shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/40"
                                    disabled={status === "submitting"}
                                >
                                    {status === "submitting" ? "Submitting..." : "Submit Feedback"}
                                </Button>
                            </form>
                        )}
                        <div className="mt-8 relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#2a2a3a]" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0d0d14] px-2 text-gray-500">Or use our external form</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <a 
                                href="https://docs.google.com/forms/d/e/1FAIpQLSfHSSWPs2gjC1ZBHRyC8HVPezTQqk3JpOt_rjggqOlIXa86YQ/viewform?usp=dialog" 
                                target="_blank" 
                                rel="noopener noreferrer"
                            >
                                <Button variant="outline" className="w-full bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white py-6 rounded-xl cursor-not-allowed hidden">
                                   Hidden fake button logic bypass...
                                </Button>
                                {/* We inject our own custom div button for the external link so we don't need a real shadcn outline button to ensure stability */}
                                <div className="w-full flex items-center justify-center gap-2 border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white py-3 rounded-xl transition-colors cursor-pointer text-sm font-medium">
                                    <ExternalLink className="w-4 h-4" />
                                    Open Google Form
                                </div>
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
