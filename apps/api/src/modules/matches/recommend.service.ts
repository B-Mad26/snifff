import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/common/prisma.service';
import { CompatibilityService } from './compatibility.service';

/**
 * Recommendation engine.
 * - Phase 1 (this impl): SQL-based shortlist (geo + breed + filters) → CompatibilityService re-rank
 * - Phase 2+: two-tower embeddings via Pinecone in PetEmbedding store (see pgvector schema)
 */
@Injectable()
export class RecommendService {
  constructor(private prisma: PrismaService, private compat: CompatibilityService) {}

  async buildStack(userId: string, petId: string, mode: string, limit = 30) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) return [];

    // Already-swiped IDs to exclude
    const seen = await this.prisma.swipe.findMany({ where: { swiperPetId: petId, mode: mode as any }, select: { targetPetId: true } });
    const seenIds = seen.map(s => s.targetPetId);

    const modeFilter =
      mode === 'ADOPTION' ? Prisma.sql`AND is_adoptable = TRUE` :
      mode === 'LOST'     ? Prisma.sql`AND is_lost = TRUE` :
      mode === 'BREEDING' ? Prisma.sql`AND is_breeding = TRUE AND intact = TRUE AND gender <> ${pet.gender}::"PetGender"` :
      Prisma.sql``;

    const seenFilter = seenIds.length > 0
      ? Prisma.sql`AND id <> ALL(${seenIds}::uuid[])`
      : Prisma.sql``;

    // Shortlist via PostGIS — exclude same owner, exclude already-swiped
    const candidates = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, breed_primary, photos, dob, size, gender, personality, vacc_status,
             ST_Distance(location, (SELECT location FROM "Pet" WHERE id = ${petId}::uuid)) / 1000.0 AS distance_km
      FROM "Pet"
      WHERE deleted_at IS NULL
        AND owner_id <> ${userId}::uuid
        AND id <> ${petId}::uuid
        ${seenFilter}
        ${modeFilter}
        AND location IS NOT NULL
      ORDER BY ST_Distance(location, (SELECT location FROM "Pet" WHERE id = ${petId}::uuid)) ASC
      LIMIT ${limit * 3};
    `;

    // Re-rank by compatibility
    const scored = await Promise.all(candidates.map(async c => ({
      ...c,
      compatibilityScore: await this.compat.score(petId, c.id),
    })));
    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Log for ML training
    await this.prisma.recommendationLog.create({
      data: { userId, petIds: scored.slice(0, limit).map(s => s.id), modelVersion: 'v1.phase1' },
    });

    return scored.slice(0, limit);
  }
}
