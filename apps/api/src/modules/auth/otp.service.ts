import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class OtpService {
  private readonly log = new Logger(OtpService.name);
  private client = process.env.TWILIO_ACCOUNT_SID
    ? twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
    : null;

  async send(phone: string) {
    if (!this.client) { this.log.warn(`[DEV OTP] phone=${phone} code=123456`); return; }
    await this.client.verify.v2.services(process.env.TWILIO_VERIFY_SID!).verifications.create({ to: phone, channel: 'sms' });
  }

  async verify(phone: string, code: string): Promise<boolean> {
    if (!this.client) return code === '123456'; // dev fallback
    const r = await this.client.verify.v2.services(process.env.TWILIO_VERIFY_SID!).verificationChecks.create({ to: phone, code });
    return r.status === 'approved';
  }
}
