import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findById(id: number) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findByProviderId(provider: string, providerId: string) {
        return this.prisma.user.findFirst({ where: { provider, providerId } });
    }

    async findByUsername(username: string) {
        return this.prisma.user.findUnique({ where: { username } });
    }

    async findByVerifyToken(token: string) {
        return this.prisma.user.findFirst({ where: { emailVerifyToken: token } });
    }

    async create(data: {
        email: string;
        password?: string | null;
        name: string;
        role?: string;
        provider?: string;
        providerId?: string;
        avatar?: string;
        emailVerified?: boolean;
    }) {
        return this.prisma.user.create({
            data: {
                email: data.email,
                password: data.password || null,
                name: data.name,
                role: (data.role as Role) || Role.STUDENT,
                provider: data.provider,
                providerId: data.providerId,
                avatar: data.avatar,
                emailVerified: data.emailVerified || false,
            },
        });
    }

    async linkOAuth(userId: number, provider: string, providerId: string, avatar?: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { provider, providerId, avatar },
        });
    }

    async updateProfile(userId: number, data: {
        username: string;
        phone: string;
        level: string;
        specialization: string;
        profileComplete: boolean;
    }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async updateUserDetails(userId: number, data: {
        name?: string;
        level?: string;
        specialization?: string;
        avatar?: string;
    }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async setVerifyToken(userId: number, token: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { emailVerifyToken: token },
        });
    }

    async markEmailVerified(userId: number) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true, emailVerifyToken: null },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, createdAt: true, username: true, avatar: true },
        });
    }

    async getEnrollments(userId: number) {
        return this.prisma.enrollment.findMany({
            where: { userId },
            include: { subject: true },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getStudentStats(userId: number) {
        const attempts = await this.prisma.attempt.findMany({
            where: { userId },
            include: { exam: { include: { subject: true } } },
            orderBy: { startedAt: 'desc' },
        });

        const totalAttempts = attempts.length;
        const completedAttempts = attempts.filter(a => a.submittedAt !== null);
        const averageScore = completedAttempts.length > 0
            ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
            : 0;

        return {
            totalAttempts,
            completedAttempts: completedAttempts.length,
            averageScore: Math.round(averageScore * 100) / 100,
            recentAttempts: attempts.slice(0, 5),
        };
    }
}
