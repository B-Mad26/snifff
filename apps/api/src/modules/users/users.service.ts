import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string, includePrivate = false) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: includePrivate ? { pets: true, breederProfile: true, subscriptions: true } : { pets: true },
    });
    if (!user) throw new NotFoundException('user_not_found');
    if (!includePrivate) {
      // strip sensitive fields
      delete (user as any).phone;
      delete (user as any).email;
    }
    return user;
  }

  update(id: string, data: Partial<{ firstName: string; bio: string; avatarUrl: string; language: string }>) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
