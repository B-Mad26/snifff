import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async submit(reporterId: string, dto: { targetKind: any; targetId: string; reason: any; detail?: string }) {
    return this.prisma.report.create({
      data: { reporterId, ...dto },
    });
  }
}
