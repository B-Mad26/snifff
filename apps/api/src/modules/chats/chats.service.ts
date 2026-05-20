import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { ToxicityService } from '../moderation/services/toxicity.service';

@Injectable()
export class ChatsService {
  private readonly TOX_BLOCK = 0.9;

  constructor(private prisma: PrismaService, private toxicity: ToxicityService) {}

  list(userId: string) {
    return this.prisma.chat.findMany({
      where: {
        match: {
          status: 'ACTIVE',
          OR: [{ petA: { ownerId: userId } }, { petB: { ownerId: userId } }],
        },
      },
      include: {
        match: { include: { petA: true, petB: true } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async messages(userId: string, chatId: string, cursor?: string) {
    await this.assertMember(userId, chatId);
    return this.prisma.message.findMany({
      where: { chatId, blocked: false },
      take: 50,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
  }

  async send(userId: string, chatId: string, dto: { type: any; content?: string; mediaUrl?: string }) {
    await this.assertMember(userId, chatId);

    let toxScore: number | null = null;
    let blocked = false;
    if (dto.type === 'TEXT' && dto.content) {
      toxScore = await this.toxicity.score(dto.content);
      blocked = toxScore >= this.TOX_BLOCK;
    }
    return this.prisma.message.create({
      data: {
        chatId,
        senderUserId: userId,
        type: dto.type,
        content: dto.content ?? null,
        mediaUrl: dto.mediaUrl ?? null,
        toxicityScore: toxScore ?? undefined,
        blocked,
      },
    });
  }

  private async assertMember(userId: string, chatId: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { match: { include: { petA: true, petB: true } } },
    });
    if (!chat) throw new NotFoundException('chat_not_found');
    const owners = [chat.match.petA.ownerId, chat.match.petB.ownerId];
    if (!owners.includes(userId)) throw new ForbiddenException();
  }
}
