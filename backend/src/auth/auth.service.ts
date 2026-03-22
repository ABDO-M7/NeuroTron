import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { CompleteProfileDto } from './dto/complete-profile.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    // ─── OAuth: Find or Create User ───────────────────────────────────────────
    async findOrCreateOAuthUser(profile: {
        provider: string;
        providerId: string;
        email: string;
        name: string;
        avatar?: string;
    }) {
        // Check by providerId first, then by email
        let user = await this.usersService.findByProviderId(profile.provider, profile.providerId);
        if (!user) {
            user = await this.usersService.findByEmail(profile.email);
        }

        if (!user) {
            // New user — create with no password
            user = await this.usersService.create({
                email: profile.email,
                name: profile.name,
                password: null,
                provider: profile.provider,
                providerId: profile.providerId,
                avatar: profile.avatar,
                emailVerified: true, // OAuth emails are pre-verified
            });

            // Send welcome verification email
            try {
                const token = crypto.randomBytes(32).toString('hex');
                await this.usersService.setVerifyToken(user.id, token);
                await this.mailService.sendVerificationEmail(user.email, token);
            } catch (_) {
                // Non-blocking: email failure doesn't prevent login
            }
        } else if (!user.providerId) {
            // Existing email-based user — link OAuth account
            user = await this.usersService.linkOAuth(user.id, profile.provider, profile.providerId, profile.avatar);
        }

        return this.buildAuthResponse(user);
    }

    // ─── Profile Completion ────────────────────────────────────────────────────
    async completeProfile(userId: number, dto: CompleteProfileDto) {
        const existing = await this.usersService.findByUsername(dto.username);
        if (existing && existing.id !== userId) {
            throw new ConflictException('Username already taken');
        }

        const user = await this.usersService.updateProfile(userId, {
            username: dto.username,
            phone: dto.phone,
            level: dto.level,
            specialization: dto.specialization,
            profileComplete: true,
        });

        return this.buildAuthResponse(user);
    }


    // ─── Helpers ───────────────────────────────────────────────────────────────
    private buildAuthResponse(user: any) {
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
            profileComplete: user.profileComplete,
            emailVerified: user.emailVerified,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                username: user.username,
                profileComplete: user.profileComplete,
                emailVerified: user.emailVerified,
            },
            accessToken: token,
        };
    }
}
