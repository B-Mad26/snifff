import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, Matches, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '@/common/decorators/current-user.decorator';

class SendOtpDto {
  @Matches(/^\+\d{8,15}$/, { message: 'phone must be E.164 (e.g. +14155551212)' }) phone!: string;
}
class VerifyOtpDto {
  @Matches(/^\+\d{8,15}$/) phone!: string;
  @IsString() @MinLength(4) code!: string;
}
class RefreshDto { @IsString() refreshToken!: string; }
class OAuthDto {
  @IsString() provider!: 'apple' | 'google' | 'facebook';
  @IsString() idToken!: string;
  @IsOptional() @IsString() firstName?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('otp/send')
  @ApiOperation({ summary: 'Send phone OTP via Twilio Verify' })
  send(@Body() dto: SendOtpDto) { return this.auth.sendOtp(dto.phone); }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and exchange for tokens' })
  verify(@Body() dto: VerifyOtpDto) { return this.auth.verifyOtp(dto.phone, dto.code); }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }

  @Post('oauth')
  oauth(@Body() dto: OAuthDto) { return this.auth.oauthLogin(dto.provider, dto.idToken, dto.firstName); }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) { return this.auth.me(user.id); }
}
