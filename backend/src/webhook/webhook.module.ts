import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller.js';
import { WebhookService } from './webhook.service.js';
import { MetaModule } from '../meta/meta.module.js';
import { FsmModule } from '../fsm/fsm.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { BotConfigModule } from '../bot-config/bot-config.module.js';

@Module({
  imports: [MetaModule, FsmModule, PrismaModule, BotConfigModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
