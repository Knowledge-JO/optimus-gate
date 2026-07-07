import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { ConfirmEmailVerificationDto } from './dto/confirm-email-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { AuthService } from './auth.service';
import type { AuthenticatedUser, RefreshAuthenticatedUser } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.signup(dto, this.getContext(request));
    this.setRefreshCookie(response, result.refreshToken);
    return result;
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto, this.getContext(request));
    this.setRefreshCookie(response, result.refreshToken);
    return result;
  }

  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refresh(
    @CurrentUser() user: RefreshAuthenticatedUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.refresh(
      user,
      this.getContext(request),
    );
    this.setRefreshCookie(response, result.refreshToken);
    return result;
  }

  @UseGuards(RefreshJwtGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: RefreshAuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.logout(user);
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
    });
    return result;
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('email-verification/resend')
  resendEmailVerification(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.resendEmailVerification(user);
  }

  @Post('email-verification/confirm')
  confirmEmailVerification(@Body() dto: ConfirmEmailVerificationDto) {
    return this.authService.confirmEmailVerification(dto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return { user };
  }

  private getContext(request: Request) {
    return {
      userAgent: request.get('user-agent'),
      ipAddress: request.ip,
    };
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/auth',
    });
  }
}
