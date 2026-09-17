import { Controller, Post, Get, Req, Res, Body, Headers, UnauthorizedException, Logger, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { WebhookService } from './webhook.service.js';
import type { Request, Response } from 'express';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response
  ) {
    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'test_verify_token';
    
    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        return res.status(HttpStatus.OK).send(challenge);
      } else {
        return res.sendStatus(HttpStatus.FORBIDDEN);
      }
    }
    return res.sendStatus(HttpStatus.BAD_REQUEST);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhookEvent(@Body() body: any, @Req() req: Request) {
    // In production, we'd verify the X-Hub-Signature-256 header here
    console.log('Received Webhook:', JSON.stringify(body, null, 2));
    
    if (body.object === 'page' || body.object === 'instagram') {
      await this.webhookService.processEvent(body);
      return 'EVENT_RECEIVED';
    } else {
      return 'UNKNOWN_EVENT';
    }
  }
}
