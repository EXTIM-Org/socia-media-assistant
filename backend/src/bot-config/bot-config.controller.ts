import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BotConfigService } from './bot-config.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('bot-config')
export class BotConfigController {
  constructor(private readonly configService: BotConfigService) {}

  // FSM Configs
  @Get()
  async getBotConfig() {
    return this.configService.getBotConfig();
  }

  @Put()
  async updateBotConfig(@Body() updateData: any) {
    return this.configService.updateBotConfig(updateData);
  }

  // Automation Rules
  @Get('rules')
  async getRules() {
    return this.configService.getRules();
  }

  @Post('rules')
  async createRule(@Body() ruleData: any) {
    return this.configService.createRule(ruleData);
  }

  @Put('rules/:id')
  async updateRule(@Param('id') id: string, @Body() ruleData: any) {
    return this.configService.updateRule(id, ruleData);
  }

  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    return this.configService.deleteRule(id);
  }
}
