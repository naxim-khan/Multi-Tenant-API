import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload, AuthResponse } from '../types/auth.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Authenticate user with email and password
     */
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password_hash)) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    /**
     * Generate access and refresh tokens
     */
    async login(user: any): Promise<AuthResponse> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenant_id: user.tenant_id,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        // Hash and store refresh token
        await this.updateRefreshToken(user.id, refreshToken);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    /**
     * Rotate refresh token
     */
    async refreshTokens(userId: number, rt: string): Promise<AuthResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { refresh_token: true }
        });

        if (!user || !user.refresh_token) {
            throw new ForbiddenException('Access Denied');
        }

        const rtMatches = await bcrypt.compare(rt, user.refresh_token.hashed_token);
        if (!rtMatches) {
            throw new ForbiddenException('Access Denied');
        }

        const tokens = await this.login(user);
        return tokens;
    }

    /**
     * Revoke refresh token (Logout)
     */
    async logout(userId: number) {
        await this.prisma.refreshToken.updateMany({
            where: {
                user_id: userId,
                is_revoked: false,
            },
            data: { is_revoked: true },
        });
    }

    /**
     * Internal: Hash and save refresh token
     */
    private async updateRefreshToken(userId: number, refreshToken: string) {
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        await this.prisma.refreshToken.upsert({
            where: { user_id: userId },
            update: {
                hashed_token: hashedToken,
                is_revoked: false,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
            create: {
                user_id: userId,
                hashed_token: hashedToken,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
    }
}
