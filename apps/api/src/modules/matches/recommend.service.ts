import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { CompatibilityService } from './compatibility.service';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class RecommendService {
  constructor(private prisma: PrismaService, private compat: CompatibilityService) {}

  async buildStack(userId: string, petId: string, mode: string, limit = 30) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) return [];

    const seen = await this.prisma.swipe.findMany({
      where: { swiperPetId: petId, mode: mode as any },
      select: { targetPetId: true },
    });
    const seenIds = new Set(seen.map(s => s.targetPetId));

    const modeWhere: any = {
      deletedAt: null,
      ownerId: { not: userId },
      id: { not: petId },
      ...(mode === 'ADOPTION' && { isAdoptable: true }),
      ...(mode === 'LOST'     && { isLost: true }),
      ...(mode === 'BREEDING' && { isBreeding: true, intact: true, gender: { not: pet.gender } }),
    };

    const candidates = await this.prisma.pet.findMany({
      where: modeWhere,
      take: limit * 3,
    });

    const filtered = candidates.filter(c => !seenIds.has(c.id));

    const scored = await Promise.all(filtered.map(async c => {
      const distanceKm = (pet.lat != null && pet.lng != null && c.lat != null && c.lng != null)
        ? haversineKm(pet.lat, pet.lng, c.lat, c.lng)
        : 999;
      return {
        ...c,
        distanceKm,
        compatibilityScore: await this.compat.score(petId, c.id),
      };
    }));

    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    await this.prisma.recommendationLog.create({
      data: { userId, petIds: scored.slice(0, limit).map(s => s.id), modelVersion: 'v1.phase1-haversine' },
    });

    return scored.slice(0, limit);
  }
}
