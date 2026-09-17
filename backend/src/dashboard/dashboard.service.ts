import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // We will query Prisma here. For now returning structure.
    const totalInteractions = await this.prisma.message.count();
    const inboundMessages = await this.prisma.message.count({ where: { direction: 'INBOUND' } });
    const outboundMessages = await this.prisma.message.count({ where: { direction: 'OUTBOUND' } });

    return {
      totalInteractions,
      inboundMessages,
      outboundMessages,
      conversionRate: 15, // Mock conversion rate
    };
  }

  async getLatestMessages() {
    return this.prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: true },
    });
  }
}
