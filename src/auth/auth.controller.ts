import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Public endpoint to log in and receive tokens
     */
    @Public()
    @ApiOperation({ summary: 'Log in and receive JWT tokens' })
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
    @ApiOperation({ summary: 'Rotate JWT access and refresh tokens' })
    @ApiBearerAuth()
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
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Log out and revoke current session' })
    @ApiBearerAuth()
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(@GetCurrentUserId() userId: number) {
        await this.authService.logout(userId);
    }
}
