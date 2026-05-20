import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class BreedersService {
  constructor(private prisma: PrismaService) {}

  listVerified() {
    return this.prisma.breeder.findMany({
      where: { verified: true },
      include: { user: { select: { firstName: true, avatarUrl: true, countryCode: true } }, litters: true },
      orderBy: { rating: 'desc' },
    });
  }

  async findById(id: string) {
    const b = await this.prisma.breeder.findUnique({
      where: { id },
      include: { user: true, litters: { include: { mom: true, dad: true } } },
    });
    if (!b) throw new NotFoundException();
    return b;
  }

  apply(userId: string, dto: any) {
    return this.prisma.breeder.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }
}
