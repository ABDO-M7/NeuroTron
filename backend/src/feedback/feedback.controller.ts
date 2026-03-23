import { Controller, Post, Body } from '@nestjs/common';
import { FeedbackService } from './feedback.service';

@Controller('feedback')
export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    @Post()
    async createFeedback(@Body() body: { message: string; rating: number }) {
        return this.feedbackService.createFeedback({
            message: body.message,
            rating: body.rating,
            userId: undefined // Public feedback
        });
    }
}
