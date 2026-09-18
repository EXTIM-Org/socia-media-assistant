import { Injectable, Logger } from '@nestjs/common';
import { MetaService } from '../meta/meta.service.js';
import { FsmService, UserState } from '../fsm/fsm.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BotConfigService } from '../bot-config/bot-config.service.js';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly metaService: MetaService,
    private readonly fsmService: FsmService,
    private readonly prisma: PrismaService,
    private readonly botConfigService: BotConfigService,
  ) {}

  async processEvent(body: any) {
    if (body.entry) {
      for (const entry of body.entry) {
        if (entry.messaging) {
          for (const event of entry.messaging) {
            await this.handleMessagingEvent(event, entry.id);
          }
        }
        if (entry.changes) {
          for (const change of entry.changes) {
            await this.handleChangeEvent(change, entry.id);
          }
        }
      }
    }
  }

  private async getOrCreateUser(igSid: string) {
    let user = await this.prisma.user.findUnique({ where: { igSid } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { igSid, username: `user_${igSid}` },
      });
    }
    return user;
  }

  private async logMessage(igSid: string, text: string, direction: 'INBOUND' | 'OUTBOUND') {
    const user = await this.getOrCreateUser(igSid);
    await this.prisma.message.create({
      data: {
        userId: user.id,
        text,
        direction,
      },
    });
  }

  private async sendAndLogMessage(pageId: string, recipientId: string, text: string) {
    await this.logMessage(recipientId, text, 'OUTBOUND');
    await this.metaService.sendDirectMessage(pageId, recipientId, { text });
  }

  private async handleMessagingEvent(event: any, pageId: string) {
    if (!event.sender || !event.sender.id) {
      this.logger.debug(`Ignored non-sender event: ${JSON.stringify(event)}`);
      return;
    }
    const senderId = event.sender.id;
    
    if (event.message && event.message.text) {
      const text = event.message.text.trim();
      this.logger.log(`Received DM from ${senderId}: ${text}`);
      
      await this.logMessage(senderId, text, 'INBOUND');

      const botConfig = await this.botConfigService.getBotConfig();

      if (text === 'لغو' || text === 'ویرایش') {
        await this.fsmService.clearUserState(senderId);
        await this.sendAndLogMessage(pageId, senderId, botConfig.cancelMessage);
        return;
      }

      const session = await this.fsmService.getUserSession(senderId);

      switch (session.state) {
        case UserState.IDLE:
          if (text === 'خرید' || text === 'سفارش') {
            await this.fsmService.setUserSession(senderId, UserState.AWAITING_NAME);
            await this.sendAndLogMessage(pageId, senderId, botConfig.welcomeMessage);
          }
          break;

        case UserState.AWAITING_NAME:
          await this.fsmService.setUserSession(senderId, UserState.AWAITING_ADDRESS, { name: text });
          const addressMsg = botConfig.askAddressMessage.replace('{name}', text);
          await this.sendAndLogMessage(pageId, senderId, addressMsg);
          break;

        case UserState.AWAITING_ADDRESS:
          await this.fsmService.setUserSession(senderId, UserState.AWAITING_PHONE, { address: text });
          await this.sendAndLogMessage(pageId, senderId, botConfig.askPhoneMessage);
          break;

        case UserState.AWAITING_PHONE:
          const phoneRegex = /^(0|0098|\+98)?9\d{9}$/;
          if (!phoneRegex.test(text)) {
            await this.sendAndLogMessage(pageId, senderId, botConfig.invalidPhoneMessage);
            return; 
          }

          const finalData: any = { ...session.data, phone: text };
          this.logger.log(`Order data collected for ${senderId}: ${JSON.stringify(finalData)}`);
          
          await this.fsmService.clearUserState(senderId);
          let successMsg = botConfig.successMessage
            .replace('{name}', finalData.name || '')
            .replace('{phone}', finalData.phone || '')
            .replace('{senderId}', senderId);
          await this.sendAndLogMessage(pageId, senderId, successMsg);
          break;
      }
    }
  }

  private async handleChangeEvent(change: any, pageId: string) {
    if (change.field === 'comments') {
      const value = change.value;
      if (value.item === 'comment' && value.verb === 'add') {
        const commentId = value.comment_id;
        const text = value.text;
        const senderId = value.from.id;
        
        this.logger.log(`Received Comment from ${senderId}: ${text}`);
        
        const automationRules = await this.botConfigService.getRules();
        
        const matchedRule = automationRules.find(rule => 
          rule.keywords.some(keyword => text.includes(keyword))
        );

        if (matchedRule) {
          this.logger.log(`Matched automation rule: ${matchedRule.id}`);
          
          if (matchedRule.replyMessages && matchedRule.replyMessages.length > 0) {
            const randomReply = matchedRule.replyMessages[
              Math.floor(Math.random() * matchedRule.replyMessages.length)
            ];
            await this.metaService.replyToComment(pageId, commentId, randomReply);
          }
          
          if (matchedRule.dmMessage) {
            await this.sendAndLogMessage(pageId, senderId, matchedRule.dmMessage);
          }
        } else {
          this.logger.log('No matching automation rule found for comment.');
        }
      }
    }
  }
}
