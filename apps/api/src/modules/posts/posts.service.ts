import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: any) {
    const pet = await this.prisma.pet.findUnique({ where: { id: dto.petId } });
    if (!pet || pet.ownerId !== userId) throw new ForbiddenException();
    return this.prisma.post.create({ data: { ...dto } });
  }

  async findById(id: string) {
    const post = await this.prisma.post.findFirst({ where: { id, deletedAt: null }, include: { pet: true } });
    if (!post) throw new NotFoundException();
    return post;
  }

  async remove(userId: string, id: string) {
    const post = await this.prisma.post.findUnique({ where: { id }, include: { pet: true } });
    if (!post || post.pet.ownerId !== userId) throw new ForbiddenException();
    return this.prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async like(userId: string, postId: string) {
    try {
      await this.prisma.postLike.create({ data: { userId, postId } });
      await this.prisma.post.update({ where: { id: postId }, data: { likeCount: { increment: 1 } } });
      return { ok: true };
    } catch (e: any) {
      if (e.code === 'P2002') return { ok: true, alreadyLiked: true };
      throw e;
    }
  }

  async unlike(userId: string, postId: string) {
    try {
      await this.prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
      await this.prisma.post.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } } });
    } catch {}
    return { ok: true };
  }

  async comment(userId: string, postId: string, body: string, parentId?: string) {
    const c = await this.prisma.postComment.create({ data: { userId, postId, body, parentId } });
    await this.prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });
    return c;
  }

  listComments(postId: string, cursor?: string) {
    return this.prisma.postComment.findMany({
      where: { postId, parentId: null, deletedAt: null },
      take: 30,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: { replies: { take: 3, orderBy: { createdAt: 'asc' } } },
    });
  }
}
