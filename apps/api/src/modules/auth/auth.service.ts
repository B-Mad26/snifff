import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { PrismaService } from '@/common/prisma.service';
import { OtpService } from './otp.service';
import { randomBytes } from 'crypto';

const JWKS: Record<string, ReturnType<typeof createRemoteJWKSet>> = {
  apple:  createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys')),
  google: createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs')),
};

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private otp: OtpService) {}

  async sendOtp(phone: string) {
    await this.otp.send(phone);
    return { ok: true };
  }

  async verifyOtp(phone: string, code: string) {
    const ok = await this.otp.verify(phone, code);
    if (!ok) throw new UnauthorizedException('invalid_otp');
    const user = await this.prisma.user.upsert({
      where: { phone },
      update: { lastActiveAt: new Date() },
      create: { phone, lastActiveAt: new Date() },
    });
    return this.issueTokens(user.id, user.subscriptionTier);
  }

  async oauthLogin(provider: 'apple' | 'google' | 'facebook', idToken: string, firstName?: string) {
    let sub: string;
    let email: string | undefined;

    if (provider === 'facebook') {
      // Facebook uses its own token inspection endpoint
      const res = await fetch(
        `https://graph.facebook.com/me?fields=id,email,name&access_token=${encodeURIComponent(idToken)}`,
      );
      if (!res.ok) throw new UnauthorizedException('invalid_facebook_token');
      const data: any = await res.json();
      if (data.error) throw new UnauthorizedException('invalid_facebook_token');
      sub = data.id;
      email = data.email;
    } else {
      const jwks = JWKS[provider];
      const audience = provider === 'apple'
        ? process.env.APPLE_CLIENT_ID
        : process.env.GOOGLE_CLIENT_ID;
      const { payload } = await jwtVerify(idToken, jwks, { audience }).catch(() => {
        throw new UnauthorizedException('invalid_oauth_token');
      });
      sub = payload.sub as string;
      email = payload.email as string | undefined;
    }

    const oauth = await this.prisma.oAuthAccount.upsert({
      where: { provider_providerUid: { provider, providerUid: sub } },
      update: {},
      create: {
        provider, providerUid: sub,
        user: { create: { firstName, email, lastActiveAt: new Date() } },
      },
      include: { user: true },
    });
    return this.issueTokens(oauth.user.id, oauth.user.subscriptionTier);
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = await this.jwt.verifyAsync(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user) throw new UnauthorizedException();
      return this.issueTokens(user.id, user.subscriptionTier);
    } catch { throw new UnauthorizedException('invalid_refresh'); }
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { pets: true, breederProfile: true, subscriptions: { where: { status: 'ACTIVE' } } },
    });
  }

  private async issueTokens(userId: string, tier: string) {
    const access  = await this.jwt.signAsync({ sub: userId, tier });
    const refresh = await this.jwt.signAsync(
      { sub: userId, jti: randomBytes(16).toString('hex') },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: `${process.env.JWT_REFRESH_TTL ?? 2592000}s` },
    );
    return { accessToken: access, refreshToken: refresh, tokenType: 'Bearer' };
  }
}
