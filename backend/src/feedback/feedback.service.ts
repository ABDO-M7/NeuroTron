import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FeedbackService {
    constructor(private prisma: PrismaService) {}

    async createFeedback(data: { userId?: number; message: string; rating: number }) {
        return this.prisma.feedback.create({
            data: {
                userId: data.userId,
                message: data.message,
                rating: data.rating,
            }
        });
    }
}
