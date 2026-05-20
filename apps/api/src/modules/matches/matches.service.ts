import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { CompatibilityService } from './compatibility.service';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService, private compat: CompatibilityService) {}

  async create(petAId: string, petBId: string, mode: any, initiatorUserId: string) {
    const [a, b] = [petAId, petBId].sort();
    const score = await this.compat.score(a, b);
    const initiatorPet = await this.prisma.pet.findFirst({ where: { ownerId: initiatorUserId, id: { in: [a, b] } } });
    const respondBy = new Date(Date.now() + 24 * 60 * 60 * 1000); // Bumble-style 24h window

    // Open chat too
    const match = await this.prisma.match.create({
      data: {
        petAId: a, petBId: b, mode,
        compatibilityScore: score,
        initiatorPetId: initiatorPet!.id,
        initiatorMustRespondBy: respondBy,
        chat: { create: {} },
      },
      include: { chat: true, petA: true, petB: true },
    });
    return match;
  }

  async findForUser(userId: string) {
    return this.prisma.match.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ petA: { ownerId: userId } }, { petB: { ownerId: userId } }],
      },
      include: { petA: true, petB: true, chat: { include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async unmatch(userId: string, matchId: string) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId }, include: { petA: true, petB: true } });
    if (!match) throw new NotFoundException();
    if (match.petA.ownerId !== userId && match.petB.ownerId !== userId) throw new ForbiddenException();
    return this.prisma.match.update({ where: { id: matchId }, data: { status: 'UNMATCHED' } });
  }
}
