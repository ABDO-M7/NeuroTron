import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AiGradingService } from '../ai-grading/ai-grading.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { QuestionType } from '@prisma/client';

@Injectable()
export class AttemptsService {
    constructor(
        private prisma: PrismaService,
        private aiGrading: AiGradingService,
    ) { }

    async startAttempt(examId: number, userId: number) {
        // Check if exam exists
        const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) throw new NotFoundException('Exam not found');

        // Check for existing incomplete attempt
        const existing = await this.prisma.attempt.findFirst({
            where: { examId, userId, submittedAt: null },
        });
        if (existing) return existing;

        return this.prisma.attempt.create({
            data: {
                examId,
                userId,
                totalPoints: await this.getTotalPoints(examId),
            },
        });
    }

    async submitAttempt(attemptId: number, userId: number, dto: SubmitAttemptDto) {
        const attempt = await this.prisma.attempt.findUnique({
            where: { id: attemptId },
            include: { exam: { include: { questions: true } } },
        });

        if (!attempt) throw new NotFoundException('Attempt not found');
        if (attempt.userId !== userId) throw new BadRequestException('Not your attempt');
        if (attempt.submittedAt) throw new BadRequestException('Already submitted');

        // Check time limit
        const elapsed = (Date.now() - attempt.startedAt.getTime()) / 1000 / 60;
        const gracePeriod = 1; // 1 minute grace
        if (elapsed > attempt.exam.duration + gracePeriod) {
            throw new BadRequestException('Time limit exceeded');
        }

        let totalScore = 0;
        const totalPoints = attempt.exam.questions.reduce((sum, q) => sum + q.points, 0);

        // Process each answer
        for (const ans of dto.answers) {
            const question = attempt.exam.questions.find(q => q.id === ans.questionId);
            if (!question) continue;

            let isCorrect: boolean | null = null;
            let aiScore: number | null = null;
            let aiFeedback: string | null = null;

            if (question.type === QuestionType.MCQ || question.type === QuestionType.TRUE_FALSE) {
                // Auto-grade MCQ and True/False
                isCorrect = ans.response?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
                if (isCorrect) totalScore += question.points;
            } else if (question.type === QuestionType.ESSAY) {
                // AI grade essays
                try {
                    const result = await this.aiGrading.gradeEssay(question.text, ans.response || '');
                    aiScore = result.score;
                    aiFeedback = result.feedback;
                    totalScore += (aiScore / 100) * question.points;
                } catch (err) {
                    aiFeedback = 'AI grading unavailable. Will be graded manually.';
                    aiScore = null;
                }
            }

            await this.prisma.answer.create({
                data: {
                    attemptId,
                    questionId: ans.questionId,
                    response: ans.response,
                    isCorrect,
                    aiScore,
                    aiFeedback,
                },
            });
        }

        // Update attempt with score
        const scorePercentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
        return this.prisma.attempt.update({
            where: { id: attemptId },
            data: {
                score: Math.round(scorePercentage * 100) / 100,
                submittedAt: new Date(),
            },
            include: {
                answers: { include: { question: true } },
                exam: true,
            },
        });
    }

    async getAttempt(attemptId: number, userId: number) {
        const attempt = await this.prisma.attempt.findUnique({
            where: { id: attemptId },
            include: {
                answers: { include: { question: true } },
                exam: { include: { subject: true } },
                user: { select: { id: true, name: true, email: true } },
            },
        });
        if (!attempt) throw new NotFoundException('Attempt not found');
        return attempt;
    }

    async getUserAttempts(userId: number) {
        return this.prisma.attempt.findMany({
            where: { userId },
            include: {
                exam: { include: { subject: true } },
            },
            orderBy: { startedAt: 'desc' },
        });
    }

    async getAllAttempts() {
        return this.prisma.attempt.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                exam: { include: { subject: true } },
            },
            orderBy: { startedAt: 'desc' },
        });
    }

    private async getTotalPoints(examId: number): Promise<number> {
        const result = await this.prisma.question.aggregate({
            where: { examId },
            _sum: { points: true },
        });
        return result._sum.points || 0;
    }

    async analyzeAttempt(attemptId: number, userId: number) {
        // Fetch the attempt with full relations exactly as needed for analysis
        const attempt = await this.prisma.attempt.findUnique({
            where: { id: attemptId },
            include: {
                answers: { include: { question: true } },
                exam: { include: { subject: true } },
            },
        });

        if (!attempt) throw new NotFoundException('Attempt not found');
        if (attempt.userId !== userId) throw new BadRequestException('Not your attempt');
        if (!attempt.submittedAt) throw new BadRequestException('Attempt not submitted yet');

        // If it already has an analysis, just return it (save tokens/time)
        if (attempt.aiAnalysis) {
            return { aiAnalysis: attempt.aiAnalysis };
        }

        // Generate the analysis using Gemini
        const generatedAnalysis = await this.aiGrading.analyzeAttempt(attempt);

        // Don't save if it's the fallback error string
        if (generatedAnalysis.includes("Analysis Error")) {
            return { aiAnalysis: generatedAnalysis }; // Return error to show on UI, but don't cache it
        }

        // Save it to the database for future views
        const updated = await this.prisma.attempt.update({
            where: { id: attemptId },
            data: { aiAnalysis: generatedAnalysis },
            select: { aiAnalysis: true } // only return what we need
        });

        return updated;
    }
}
