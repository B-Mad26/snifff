import { ForbiddenException, Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { MatchesService } from '../matches/matches.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ForbiddenException as Forbidden } from '@nestjs/common';

@Injectable()
export class SwipesService {
  // Daily swipe limits per tier
  private readonly DAILY_LIMITS: Record<string, number> = { FREE: 50, PLUS: -1, GOLD: -1, BREEDER_PRO: -1 };

  constructor(
    private prisma: PrismaService,
    private matches: MatchesService,
    private notifs: NotificationsService,
  ) {}

  async record(userId: string, dto: { swiperPetId: string; targetPetId: string; action: 'SNIFF'|'SUPER_SNIFF'|'PASS'; mode: any }) {
    // 1. ownership
    const myPet = await this.prisma.pet.findUnique({ where: { id: dto.swiperPetId } });
    if (!myPet || myPet.ownerId !== userId) throw new ForbiddenException('not_your_pet');
    if (dto.swiperPetId === dto.targetPetId) throw new BadRequestException('self_swipe');

    // 2. quota
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    const limit = this.DAILY_LIMITS[me!.subscriptionTier];
    if (limit !== -1) {
      const todayStart = new Date(); todayStart.setHours(0,0,0,0);
      const count = await this.prisma.swipe.count({ where: { swiperUserId: userId, createdAt: { gte: todayStart } } });
      if (count >= limit) throw new Forbidden('daily_swipe_limit_reached');
    }

    // 3. write swipe (idempotent — already-swiped throws via unique constraint)
    try {
      await this.prisma.swipe.create({
        data: {
          swiperUserId: userId,
          swiperPetId: dto.swiperPetId,
          targetPetId: dto.targetPetId,
          mode: dto.mode,
          action: dto.action,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') return { ok: true, duplicate: true };
      throw e;
    }

    // 4. PASS — done
    if (dto.action === 'PASS') return { ok: true };

    // 5. Check for reciprocal Sniff → match
    const reciprocal = await this.prisma.swipe.findFirst({
      where: {
        swiperPetId: dto.targetPetId,
        targetPetId: dto.swiperPetId,
        mode: dto.mode,
        action: { in: ['SNIFF', 'SUPER_SNIFF'] },
      },
    });
    if (!reciprocal) return { ok: true, matched: false };

    const match = await this.matches.create(dto.swiperPetId, dto.targetPetId, dto.mode, userId);
    await this.notifs.matchNew(match);
    return { ok: true, matched: true, match };
  }
}
