import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MetaModule } from './meta/meta.module.js';
import { WebhookModule } from './webhook/webhook.module.js';
import { FsmModule } from './fsm/fsm.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { BotConfigModule } from './bot-config/bot-config.module.js';

@Module({
  imports: [
    PrismaModule, 
    MetaModule, 
    WebhookModule, 
    FsmModule, 
    AuthModule, 
    UsersModule, 
    DashboardModule,
    BotConfigModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
