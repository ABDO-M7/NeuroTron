import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI, Type, Schema } from '@google/genai';

interface GradingResult {
    score: number;   // 0-100
    feedback: string;
}

@Injectable()
export class AiGradingService {
    private readonly logger = new Logger(AiGradingService.name);
    private ai: GoogleGenAI | null = null;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            this.ai = new GoogleGenAI({ apiKey });
            this.logger.log('Gemini AI client initialized successfully.');
        } else {
            this.logger.warn('GEMINI_API_KEY environment variable is missing.');
        }
    }

    async gradeEssay(question: string, answer: string, imageDesc?: string): Promise<GradingResult> {
        if (!answer || answer.trim().length === 0) {
            return { score: 0, feedback: 'No answer provided.' };
        }

        if (!this.ai) {
            this.logger.warn('Gemini client not initialized, using fallback grading');
            return this.fallbackGrade(answer);
        }

        try {
            let prompt = `You are an expert academic grader. Grade the following essay answer on a scale of 0 to 100.\nConsider these criteria:\n- Accuracy and correctness of content (50%)\n- Depth of understanding shown (30%)\n- Clarity and organization of writing (20%)\n\n`;

            if (imageDesc) {
                prompt += `Visual Context for this Question (the student was shown an image with the following description):\n${imageDesc}\n\n`;
            }

            prompt += `Question: ${question}\n\nStudent's Answer: ${answer}`;

            const responseSchema: Schema = {
                type: Type.OBJECT,
                properties: {
                    score: {
                        type: Type.INTEGER,
                        description: "The grade score from 0 to 100",
                    },
                    feedback: {
                        type: Type.STRING,
                        description: "Specific constructive feedback on the student's answer",
                    },
                },
                required: ["score", "feedback"],
            };

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                    temperature: 0.2, // Low temperature for more consistent, objective grading
                }
            });

            if (!response.text) {
                throw new Error("Empty response from Gemini");
            }

            const data = JSON.parse(response.text);
            return {
                score: Math.min(100, Math.max(0, Number(data.score) || 0)),
                feedback: data.feedback || 'Grading complete.',
            };

        } catch (error) {
            this.logger.error('AI grading failed', error);
            return this.fallbackGrade(answer);
        }
    }

    private fallbackGrade(answer: string): GradingResult {
        // Simple heuristic-based grading as fallback
        const wordCount = answer.trim().split(/\s+/).length;
        const sentenceCount = answer.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const hasStructure = sentenceCount >= 3;
        const isLong = wordCount >= 50;
        const isMedium = wordCount >= 20;

        let score = 30; // base score for any attempt
        if (isMedium) score += 20;
        if (isLong) score += 15;
        if (hasStructure) score += 15;
        if (wordCount >= 100) score += 10;

        score = Math.min(85, score); // cap fallback at 85

        const feedback = `Auto-graded based on response analysis. ${wordCount < 20 ? 'Consider providing a more detailed response.' :
            wordCount < 50 ? 'Good attempt, but try to elaborate more on your points.' :
                'Solid response length. AI grading was unavailable; a manual review may adjust the score.'
            } (Word count: ${wordCount})`;

        return { score, feedback };
    }

    async analyzeAttempt(attemptData: any): Promise<string> {
        if (!this.ai) {
            return "AI Analysis is currently unavailable. Please ask your administrator to configure the AI integration.";
        }

        try {
            let prompt = `You are an expert tutor and academic coach analyzing a student's exam attempt.
Please generate a personalized, encouraging, and highly structured report in Markdown.

Exam Subject: ${attemptData.exam?.subject?.name || 'General'}
Exam Title: ${attemptData.exam?.title || 'Assessment'}
Student Score: ${attemptData.score}%

Your report MUST NOT contain any JSON, only clean Markdown.
It should include:
1. **Performance Summary**: A brief, encouraging overview.
2. **Key Strengths**: Identify what they did well.
3. **Areas for Improvement**: Pinpoint 1-3 specific topics they struggled with based on incorrect answers or low-scoring essays.
4. **Actionable Revision Plan**: Give them concrete advice on what precisely to study next to master those missed topics.

Here is the breakdown of their answers:
`;

            if (attemptData.answers && attemptData.answers.length > 0) {
                attemptData.answers.forEach((ans: any, index: number) => {
                    const q = ans.question;
                    if (!q) return;

                    prompt += `\n--- Question ${index + 1} ---\n`;
                    prompt += `Question Text: ${q.text}\n`;
                    prompt += `Type: ${q.type}\n`;
                    prompt += `Student Response: ${ans.response || '[No answer]'}\n`;
                    
                    if (q.correctAnswer) {
                        prompt += `Expected Correct Answer: ${q.correctAnswer}\n`;
                    }
                    
                    if (ans.isCorrect !== null) {
                        prompt += `Marked as: ${ans.isCorrect ? 'Correct' : 'Incorrect'}\n`;
                    }

                    if (ans.aiFeedback) {
                        prompt += `AI Essay Score: ${ans.aiScore}%\n`;
                        prompt += `AI Essay Feedback: ${ans.aiFeedback}\n`;
                    }
                });
            } else {
                prompt += `\nNo answers were recorded for this attempt.\n`;
            }

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash', // Switched to flash to ensure compatibility/quota
                contents: prompt,
                config: {
                    temperature: 0.3,
                }
            });

            if (!response.text) {
                throw new Error("Empty response from Gemini");
            }

            return response.text.trim();

        } catch (error: any) {
            this.logger.error('AI attempt analysis failed', error);
            return `> 🤖 **Analysis Error:** We encountered an issue while generating your report.\n\n**Technical Details:** ${error.message || String(error)}`;
        }
    }
}
