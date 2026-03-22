import { Controller, Get, Post, Body, UseGuards, Req, Res, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // ─── Google OAuth ──────────────────────────────────────────────────────────
    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleAuth() { /* redirect handled by passport */ }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleCallback(@Req() req: any, @Res() res: Response) {
        const { accessToken } = req.user;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Always land on /login — it handles routing based on profileComplete & role
        res.redirect(`${frontendUrl}/login?token=${accessToken}`);
    }

    // ─── GitHub OAuth ──────────────────────────────────────────────────────────
    @Get('github')
    @UseGuards(AuthGuard('github'))
    githubAuth() { /* redirect handled by passport */ }

    @Get('github/callback')
    @UseGuards(AuthGuard('github'))
    async githubCallback(@Req() req: any, @Res() res: Response) {
        const { accessToken } = req.user;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Always land on /login — it handles routing based on profileComplete & role
        res.redirect(`${frontendUrl}/login?token=${accessToken}`);
    }

    // ─── Profile Completion ────────────────────────────────────────────────────
    @Post('complete-profile')
    @UseGuards(JwtAuthGuard)
    async completeProfile(@Req() req: any, @Body() dto: CompleteProfileDto) {
        return this.authService.completeProfile(req.user.sub, dto);
    }

}
