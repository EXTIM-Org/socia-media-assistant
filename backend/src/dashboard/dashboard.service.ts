import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const totalInteractions = await this.prisma.message.count();
    const inboundMessages = await this.prisma.message.count({ where: { direction: 'INBOUND' } });
    const outboundMessages = await this.prisma.message.count({ where: { direction: 'OUTBOUND' } });

    const totalUsers = await this.prisma.user.count();
    const leadsCount = await this.prisma.user.count({ where: { phone: { not: null } } });
    const conversionRate = totalUsers > 0 ? Math.round((leadsCount / totalUsers) * 100) : 0;

    return {
      totalInteractions,
      inboundMessages,
      outboundMessages,
      conversionRate,
    };
  }

  async getLatestMessages() {
    return this.prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: true },
    });
  }

  async getChartData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMessages = await this.prisma.message.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, direction: true }
    });

    const grouped: Record<string, { inbound: number, outbound: number }> = {};
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      grouped[dateStr] = { inbound: 0, outbound: 0 };
    }

    for (const msg of recentMessages) {
      const dateStr = msg.createdAt.toISOString().split('T')[0];
      if (grouped[dateStr]) {
        if (msg.direction === 'INBOUND') grouped[dateStr].inbound++;
        if (msg.direction === 'OUTBOUND') grouped[dateStr].outbound++;
      }
    }

    return Object.keys(grouped).map(date => ({
      date,
      inbound: grouped[date].inbound,
      outbound: grouped[date].outbound,
    }));
  }

  async getOrders() {
    return this.prisma.user.findMany({
      where: { phone: { not: null } },
      orderBy: { updatedAt: 'desc' },
      include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } }
    });
  }
}
