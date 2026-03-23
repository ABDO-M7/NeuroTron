import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.subject.findMany({
            include: {
                _count: { select: { lessons: true, exams: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const subject = await this.prisma.subject.findUnique({
            where: { id },
            include: {
                lessons: { orderBy: { order: 'asc' } },
                exams: { orderBy: { createdAt: 'desc' } },
            },
        });
        if (!subject) throw new NotFoundException('Subject not found');
        return subject;
    }

    async create(dto: CreateSubjectDto) {
        return this.prisma.subject.create({ data: dto });
    }

    async update(id: number, dto: UpdateSubjectDto) {
        await this.findOne(id);
        return this.prisma.subject.update({ where: { id }, data: dto });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.subject.delete({ where: { id } });
    }

    async enrollStudent(subjectId: number, userId: number) {
        // check if subject exists
        await this.findOne(subjectId);
        
        // check if already enrolled
        const existing = await this.prisma.enrollment.findUnique({
            where: { userId_subjectId: { userId, subjectId } }
        });
        if (existing) return existing;

        return this.prisma.enrollment.create({
            data: { userId, subjectId }
        });
    }
}
