import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
    constructor(private prisma: PrismaService) { }

    async findAll(subjectId?: number) {
        return this.prisma.exam.findMany({
            where: subjectId ? { subjectId } : undefined,
            include: {
                subject: true,
                _count: { select: { questions: true, attempts: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                subject: true,
                questions: { orderBy: { order: 'asc' } },
            },
        });
        if (!exam) throw new NotFoundException('Exam not found');
        return exam;
    }

    // Get exam without correct answers (for students taking exam)
    async findOneForStudent(id: number) {
        const exam = await this.prisma.exam.findUnique({
            where: { id },
            include: {
                subject: true,
                questions: {
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        type: true,
                        text: true,
                        options: true,
                        imageUrl: true,
                        points: true,
                        order: true,
                    },
                },
            },
        });
        if (!exam) throw new NotFoundException('Exam not found');
        return exam;
    }

    async create(dto: CreateExamDto) {
        return this.prisma.exam.create({
            data: {
                title: dto.title,
                subjectId: dto.subjectId,
                duration: dto.duration,
                questions: {
                    create: dto.questions?.map((q, index) => ({
                        type: q.type as QuestionType,
                        text: q.text,
                        options: q.options ?? undefined,
                        correctAnswer: q.correctAnswer,
                        imageUrl: q.imageUrl,
                        imageDesc: q.imageDesc,
                        points: q.points || 1,
                        order: q.order ?? index,
                    })) || [],
                },
            },
            include: { questions: true },
        });
    }

    async update(id: number, dto: UpdateExamDto) {
        await this.findOne(id);

        if (dto.questions) {
            await this.prisma.question.deleteMany({ where: { examId: id } });
        }

        return this.prisma.exam.update({
            where: { id },
            data: {
                title: dto.title,
                duration: dto.duration,
                questions: dto.questions ? {
                    create: dto.questions.map((q, index) => ({
                        type: q.type as QuestionType,
                        text: q.text,
                        options: q.options ?? undefined,
                        correctAnswer: q.correctAnswer,
                        imageUrl: q.imageUrl,
                        imageDesc: q.imageDesc,
                        points: q.points || 1,
                        order: q.order ?? index,
                    })),
                } : undefined,
            },
            include: { questions: { orderBy: { order: 'asc' } } },
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.exam.delete({ where: { id } });
    }

    async getResults(examId: number) {
        return this.prisma.attempt.findMany({
            where: { examId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                answers: { include: { question: true } },
            },
            orderBy: { submittedAt: 'desc' },
        });
    }

    async getStats(id: number) {
        const exam = await this.prisma.exam.findUnique({ where: { id } });
        if (!exam) throw new NotFoundException('Exam not found');

        const attempts = await this.prisma.attempt.findMany({
            where: { examId: id },
            include: {
                user: { select: { id: true, name: true, email: true, username: true } },
            },
            orderBy: { score: 'desc' },
        });

        const totalAttempts = attempts.length;
        const uniqueUsers = new Set(attempts.map(a => a.userId)).size;
        const bestGrade = attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0;
        const avgGrade = attempts.length > 0 ? attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length : 0;

        return {
            exam,
            metrics: {
                totalAttempts,
                uniqueUsers,
                bestGrade,
                avgGrade
            },
            attempts
        };
    }
}
