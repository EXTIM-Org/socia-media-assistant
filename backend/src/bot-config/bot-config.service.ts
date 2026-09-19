import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BotConfigService {
  private readonly logger = new Logger(BotConfigService.name);

  constructor(private prisma: PrismaService) {}

  async getBotConfig() {
    let config = await this.prisma.botConfig.findFirst();
    if (!config) {
      config = await this.prisma.botConfig.create({ data: {} });
    }
    return config;
  }

  async updateBotConfig(data: any) {
    const config = await this.getBotConfig();
    return this.prisma.botConfig.update({
      where: { id: config.id },
      data: {
        welcomeMessage: data.welcomeMessage,
        askAddressMessage: data.askAddressMessage,
        askPhoneMessage: data.askPhoneMessage,
        invalidPhoneMessage: data.invalidPhoneMessage,
        successMessage: data.successMessage,
        cancelMessage: data.cancelMessage,
        saveUsername: data.saveUsername !== undefined ? data.saveUsername : config.saveUsername,
        saveProfilePic: data.saveProfilePic !== undefined ? data.saveProfilePic : config.saveProfilePic,
        saveIsVerified: data.saveIsVerified !== undefined ? data.saveIsVerified : config.saveIsVerified,
        saveFollowerCount: data.saveFollowerCount !== undefined ? data.saveFollowerCount : config.saveFollowerCount,
        saveIsFollower: data.saveIsFollower !== undefined ? data.saveIsFollower : config.saveIsFollower,
        saveIgSid: data.saveIgSid !== undefined ? data.saveIgSid : config.saveIgSid,
        enableWatermark: data.enableWatermark !== undefined ? data.enableWatermark : config.enableWatermark,
        watermarkText: data.watermarkText !== undefined ? data.watermarkText : config.watermarkText,
        watermarkLinkUrl: data.watermarkLinkUrl !== undefined ? data.watermarkLinkUrl : config.watermarkLinkUrl,
      },
    });
  }

  async getRules() {
    return this.prisma.automationRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(data: any) {
    return this.prisma.automationRule.create({
      data: {
        keywords: data.keywords || [],
        dmMessage: data.dmMessage || '',
        replyMessages: data.replyMessages || [],
      },
    });
  }

  async updateRule(id: string, data: any) {
    return this.prisma.automationRule.update({
      where: { id },
      data: {
        keywords: data.keywords,
        dmMessage: data.dmMessage,
        replyMessages: data.replyMessages,
      },
    });
  }

  async deleteRule(id: string) {
    return this.prisma.automationRule.delete({
      where: { id },
    });
  }
}
