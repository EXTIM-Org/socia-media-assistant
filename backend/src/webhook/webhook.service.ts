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

  private async sendAndLogMessage(pageId: string, recipientId: string, text: string, buttons?: any[]) {
    await this.logMessage(recipientId, text, 'OUTBOUND');
    let messageData: any;
    
    if (buttons && buttons.length > 0) {
      const formattedButtons = buttons.slice(0, 3).map(btn => ({
        type: 'postback',
        title: btn.title,
        payload: btn.payload
      }));
      
      messageData = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: text,
            buttons: formattedButtons
          }
        }
      };
    } else {
      messageData = { text };
    }
    
    await this.metaService.sendDirectMessage(pageId, recipientId, messageData);
  }

  private async handleMessagingEvent(event: any, pageId: string) {
    if (!event.sender || !event.sender.id) {
      this.logger.debug(`Ignored non-sender event: ${JSON.stringify(event)}`);
      return;
    }
    const senderId = event.sender.id;
    
    if (senderId === pageId || event.message?.is_echo) {
      this.logger.debug('Ignored echo/self message');
      return;
    }
    
    const text = event.message?.text?.trim();
    const quickReplyPayload = event.message?.quick_reply?.payload;
    const postbackPayload = event.postback?.payload;
    const postbackTitle = event.postback?.title;
    const payload = quickReplyPayload || postbackPayload;

    if (!text && !payload) return;

    const messageText = text || `[دکمه: ${postbackTitle || payload}]`;
    
    this.logger.log(`Received DM from ${senderId}: ${messageText} (Payload: ${payload})`);
    
    await this.logMessage(senderId, messageText, 'INBOUND');

    const botConfig = await this.botConfigService.getBotConfig();

    if (payload === 'CANCEL' || text === 'انصراف' || text === 'لغو') {
        await this.fsmService.clearUserState(senderId);
        await this.sendAndLogMessage(pageId, senderId, botConfig.cancelMessage);
        return;
    }

    if (text === 'ویرایش') {
        const session = await this.fsmService.getUserSession(senderId);
        
        if (session.state === UserState.IDLE || session.state === UserState.AWAITING_NAME) {
          await this.fsmService.clearUserState(senderId);
          await this.sendAndLogMessage(pageId, senderId, 'پروسه خرید قبلی شما لغو شد. برای شروع مجدد، «خرید» را بفرستید.');
          return;
        } else if (session.state === UserState.AWAITING_ADDRESS) {
          await this.fsmService.setUserSession(senderId, UserState.AWAITING_NAME);
          await this.sendAndLogMessage(pageId, senderId, botConfig.welcomeMessage);
          return;
        } else if (session.state === UserState.AWAITING_PHONE) {
          await this.fsmService.setUserSession(senderId, UserState.AWAITING_ADDRESS, { name: session.data.name });
          const addressMsg = botConfig.askAddressMessage.replace('{name}', session.data.name || '');
          await this.sendAndLogMessage(pageId, senderId, addressMsg);
          return;
        }
    }

    if (payload === 'SUPPORT') {
      await this.sendAndLogMessage(pageId, senderId, 'همکاران ما در اولین فرصت پاسخگوی شما خواهند بود. 📞');
      return;
    }

    const session = await this.fsmService.getUserSession(senderId);

    switch (session.state) {
      case UserState.IDLE:
        if (payload === 'START_ORDER' || text === 'خرید' || text === 'سفارش') {
          await this.fsmService.setUserSession(senderId, UserState.AWAITING_NAME);
          const welcomeText = `${botConfig.welcomeMessage}\n\n(شما در هر مرحله می‌توانید با ارسال کلمه «انصراف» پروسه را متوقف کرده و یا با ارسال کلمه «ویرایش» به مرحله قبل برگردید.)`;
          await this.sendAndLogMessage(pageId, senderId, welcomeText);
        } else {
          // Main Menu
          const menuBtns = [
            { content_type: 'text', title: '🛒 ثبت سفارش', payload: 'START_ORDER' },
            { content_type: 'text', title: '📞 پشتیبانی', payload: 'SUPPORT' }
          ];
          await this.sendAndLogMessage(pageId, senderId, 'سلام! چطور می‌تونم کمکت کنم؟ 👇', menuBtns);
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
        // Convert Persian/Arabic digits to English digits
        const englishText = text.replace(/[۰-۹]/g, (d: string) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
                                .replace(/[٠-٩]/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                                
        const phoneRegex = /^(0|0098|\+98)?9\d{9}$/;
        if (!phoneRegex.test(englishText)) {
          await this.sendAndLogMessage(pageId, senderId, botConfig.invalidPhoneMessage);
          return; 
        }

        const finalData: any = { ...session.data, phone: englishText };
        this.logger.log(`Order data collected for ${senderId}: ${JSON.stringify(finalData)}`);
        
        const user = await this.getOrCreateUser(senderId);
        
        await this.prisma.order.create({
          data: {
            userId: user.id,
            fullName: finalData.name,
            address: finalData.address,
            phone: finalData.phone,
          }
        });
        
        await this.fsmService.clearUserState(senderId);
        let successMsg = botConfig.successMessage
          .replace('{name}', finalData.name || '')
          .replace('{phone}', finalData.phone || '')
          .replace('{senderId}', senderId);
        await this.sendAndLogMessage(pageId, senderId, successMsg);
        break;
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
