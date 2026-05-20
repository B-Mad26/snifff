import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';

/**
 * Snifff compatibility scoring — weighted sum of 8 factors → 0..100.
 * Tuned for friendship + breeding + adoption. Hard filters layered on top.
 */
@Injectable()
export class CompatibilityService {
  private readonly W = {
    distance:    0.25,
    breed:       0.15,
    personality: 0.15,
    size:        0.10,
    age:         0.10,
    activity:    0.10,
    health:      0.10,
    owner:       0.05,
  };

  constructor(private prisma: PrismaService) {}

  async score(petAId: string, petBId: string): Promise<number> {
    const [a, b] = await Promise.all([
      this.prisma.pet.findUnique({ where: { id: petAId }, include: { owner: true } }),
      this.prisma.pet.findUnique({ where: { id: petBId }, include: { owner: true } }),
    ]);
    if (!a || !b) return 0;

    // distance via PostGIS
    const distRow = await this.prisma.$queryRaw<{ km: number }[]>`
      SELECT ST_Distance(p1.location, p2.location) / 1000.0 AS km
      FROM "Pet" p1, "Pet" p2 WHERE p1.id = ${a.id}::uuid AND p2.id = ${b.id}::uuid`;
    const km = distRow[0]?.km ?? 50;
    const dScore   = Math.max(0, 100 - km * 2);                                     // 50km → 0
    const breedScr = a.breedPrimary && a.breedPrimary === b.breedPrimary ? 100 : 60;
    const persScr  = this.cosine(a.personality as any, b.personality as any) * 100;
    const sizeScr  = this.sizeCompat(a.size, b.size);
    const ageScr   = this.ageProximity(a.dob, b.dob);
    const actScr   = 100 - Math.abs(((a.personality as any)?.energy ?? 5) - ((b.personality as any)?.energy ?? 5)) * 10;
    const healthScr = (a.vaccStatus === 'COMPLETE' && b.vaccStatus === 'COMPLETE') ? 100 : 60;
    const ownerScr = a.owner.countryCode === b.owner.countryCode ? 80 : 60;

    const final =
      this.W.distance    * dScore +
      this.W.breed       * breedScr +
      this.W.personality * persScr +
      this.W.size        * sizeScr +
      this.W.age         * ageScr +
      this.W.activity    * Math.max(0, actScr) +
      this.W.health      * healthScr +
      this.W.owner       * ownerScr;

    return Math.round(Math.max(0, Math.min(100, final)));
  }

  private cosine(x: Record<string, number> = {}, y: Record<string, number> = {}) {
    const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
    let dot = 0, mx = 0, my = 0;
    for (const k of keys) { const a = x[k] ?? 0, b = y[k] ?? 0; dot += a*b; mx += a*a; my += b*b; }
    if (!mx || !my) return 0.5;
    return dot / (Math.sqrt(mx) * Math.sqrt(my));
  }
  private sizeCompat(a?: string | null, b?: string | null) {
    const order = ['TOY','SMALL','MEDIUM','LARGE','GIANT'];
    const ai = order.indexOf(a ?? 'MEDIUM'), bi = order.indexOf(b ?? 'MEDIUM');
    return Math.max(0, 100 - Math.abs(ai - bi) * 25);
  }
  private ageProximity(a?: Date | null, b?: Date | null) {
    if (!a || !b) return 60;
    const yrs = Math.abs((a.getTime() - b.getTime()) / (365.25 * 24 * 3600 * 1000));
    return Math.max(0, 100 - yrs * 8);
  }
}
