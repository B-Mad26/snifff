import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';
import { BioService } from '../ai/services/bio.service';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService, private bio: BioService) {}

  findByOwner(ownerId: string) {
    return this.prisma.pet.findMany({ where: { ownerId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const pet = await this.prisma.pet.findFirst({ where: { id, deletedAt: null } });
    if (!pet) throw new NotFoundException('pet_not_found');
    return pet;
  }

  async create(ownerId: string, dto: any) {
    const { lat, lng, ...rest } = dto;
    const pet = await this.prisma.pet.create({ data: { ...rest, ownerId } });
    if (typeof lat === 'number' && typeof lng === 'number') {
      await this.prisma.$executeRaw`UPDATE "Pet" SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) WHERE id = ${pet.id}::uuid`;
    }
    return pet;
  }

  async update(ownerId: string, id: string, dto: any) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet) throw new NotFoundException();
    if (pet.ownerId !== ownerId) throw new ForbiddenException();
    const { lat, lng, ...rest } = dto;
    const updated = await this.prisma.pet.update({ where: { id }, data: rest });
    if (typeof lat === 'number' && typeof lng === 'number') {
      await this.prisma.$executeRaw`UPDATE "Pet" SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) WHERE id = ${id}::uuid`;
    }
    return updated;
  }

  async remove(ownerId: string, id: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet || pet.ownerId !== ownerId) throw new ForbiddenException();
    return this.prisma.pet.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async generateBio(ownerId: string, id: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    if (!pet || pet.ownerId !== ownerId) throw new ForbiddenException();
    const bio = await this.bio.generate(pet);
    return this.prisma.pet.update({ where: { id }, data: { bio, bioAiGenerated: true } });
  }

  // Geo radius search using PostGIS — excludes deleted pets and the caller's own pets
  async nearby(userId: string, lat: number, lng: number, radiusKm: number, mode?: string) {
    const radiusM = radiusKm * 1000;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, breed_primary, photos, dob, size, gender,
             ST_Distance(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) / 1000.0 AS distance_km
      FROM "Pet"
      WHERE deleted_at IS NULL
        AND owner_id <> ${userId}::uuid
        AND location IS NOT NULL
        AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusM})
        ${mode === 'ADOPTION' ? this.prisma.$queryRaw`AND is_adoptable = TRUE` : this.prisma.$queryRaw``}
        ${mode === 'LOST'     ? this.prisma.$queryRaw`AND is_lost = TRUE`     : this.prisma.$queryRaw``}
        ${mode === 'BREEDING' ? this.prisma.$queryRaw`AND is_breeding = TRUE AND intact = TRUE` : this.prisma.$queryRaw``}
      ORDER BY distance_km ASC
      LIMIT 100;
    `;
    return rows;
  }
}
