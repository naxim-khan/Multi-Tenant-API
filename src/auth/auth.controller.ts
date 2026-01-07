import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Public endpoint to log in and receive tokens
     */
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    /**
     * Public endpoint to rotate refresh tokens
     * Uses JwtRefreshGuard to validate the refresh token
     */
    @Public()
    @UseGuards(JwtRefreshGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @GetCurrentUserId() userId: number,
        @GetCurrentUser('refreshToken') refreshToken: string,
    ) {
        return this.authService.refreshTokens(userId, refreshToken);
    }

    /**
     * Protected endpoint to log out (revokes session)
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@GetCurrentUserId() userId: number) {
        await this.authService.logout(userId);
        return { message: 'Logged out successfully' };
    }
}
