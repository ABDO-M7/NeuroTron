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

    async gradeEssay(question: string, answer: string): Promise<GradingResult> {
        if (!answer || answer.trim().length === 0) {
            return { score: 0, feedback: 'No answer provided.' };
        }

        if (!this.ai) {
            this.logger.warn('Gemini client not initialized, using fallback grading');
            return this.fallbackGrade(answer);
        }

        try {
            const prompt = `You are an expert academic grader. Grade the following essay answer on a scale of 0 to 100.
Consider these criteria:
- Accuracy and correctness of content (40%)
- Clarity and organization of writing (25%)
- Depth of understanding shown (25%)
- Spelling and grammar (10%)

Question: ${question}

Student's Answer: ${answer}`;

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
}
