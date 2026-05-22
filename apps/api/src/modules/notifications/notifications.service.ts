import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class NotificationsService {
  private log = new Logger(NotificationsService.name);
  private readonly fcmKey = process.env.FCM_SERVER_KEY;

  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  }

  async matchNew(match: any) {
    const targets = [match.petA.ownerId, match.petB.ownerId];
    for (const userId of targets) {
      await this.prisma.notification.create({
        data: { userId, type: 'MATCH_NEW', payload: { matchId: match.id, mode: match.mode } },
      });
      const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { pushToken: true, pushPlatform: true } });
      if (user?.pushToken) {
        await this.sendPush(user.pushToken, "It's a match!", 'Open the app to start chatting.', { matchId: match.id });
      }
    }
  }

  private sendPush(token: string, title: string, body: string, data: Record<string, string> = {}): Promise<void> {
    if (!this.fcmKey) {
      this.log.warn('FCM_SERVER_KEY not set - push skipped');
      return Promise.resolve();
    }
    const payload = JSON.stringify({
      to: token,
      notification: { title, body, sound: 'default' },
      data,
      apns: { payload: { aps: { badge: 1 } } },
    });
    return new Promise((resolve) => {
      const req = https.request(
        {
          hostname: 'fcm.googleapis.com',
          path: '/fcm/send',
          method: 'POST',
          headers: {
            Authorization: `key=${this.fcmKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          res.resume();
          if (res.statusCode !== 200) {
            this.log.warn(`FCM responded ${res.statusCode} for token ${token.slice(0, 12)}`);
          }
          resolve();
        },
      );
      req.on('error', (err) => { this.log.error(`FCM request failed: ${err.message}`); resolve(); });
      req.write(payload);
      req.end();
    });
  }
}
