import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  /** Tails — TikTok-style algorithmic video feed (Phase 1: recency + engagement). */
  tails(userId: string, cursor?: string) {
    return this.prisma.post.findMany({
      where: { type: 'TAIL', deletedAt: null, visibility: 'PUBLIC' },
      take: 20,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ likeCount: 'desc' }, { createdAt: 'desc' }],
      include: { pet: { select: { id: true, name: true, photos: true, breedPrimary: true } } },
    });
  }

  /** Discover — photo posts from pets they don't follow yet (cold-start onboarding). */
  discover(userId: string, cursor?: string) {
    return this.prisma.post.findMany({
      where: { type: { in: ['PHOTO', 'CAROUSEL'] }, deletedAt: null, visibility: 'PUBLIC' },
      take: 20,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { pet: { select: { id: true, name: true, photos: true, breedPrimary: true } } },
    });
  }
}
