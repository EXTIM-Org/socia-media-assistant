import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class MetaService {
  private readonly logger = new Logger(MetaService.name);
  private readonly graphApiVersion = 'v20.0'; // Using the latest API version
  private readonly baseUrl = `https://graph.facebook.com/${this.graphApiVersion}`;

  verifySignature(payload: string, signature: string): boolean {
    const appSecret = process.env.META_APP_SECRET;
    if (!appSecret) {
      this.logger.warn('META_APP_SECRET is not set. Skipping signature verification.');
      return true; // Skip in dev if not set
    }

    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex')}`;

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  async sendDirectMessage(pageId: string, recipientId: string, messageData: any): Promise<boolean> {
    this.logger.log(`Sending DM to User ${recipientId}: ${JSON.stringify(messageData)}`);
    const pageAccessToken = process.env.META_ACCESS_TOKEN;

    if (!pageAccessToken) {
      this.logger.error('META_ACCESS_TOKEN is missing!');
      return false;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/me/messages`,
        {
          recipient: { id: recipientId },
          message: messageData,
        },
        {
          headers: {
            Authorization: `Bearer ${pageAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      this.logger.log(`Message sent successfully. Response: ${JSON.stringify(response.data)}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to send message: ${error.response?.data?.error?.message || error.message}`
      );
      return false;
    }
  }

  async replyToComment(pageId: string, commentId: string, text: string): Promise<boolean> {
    this.logger.log(`Replying to Comment ${commentId}: ${text}`);
    const pageAccessToken = process.env.META_ACCESS_TOKEN;

    if (!pageAccessToken) {
      this.logger.error('META_ACCESS_TOKEN is missing!');
      return false;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/${commentId}/replies`,
        {
          message: text,
        },
        {
          headers: {
            Authorization: `Bearer ${pageAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`Replied to comment successfully. Response: ${JSON.stringify(response.data)}`);
      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to reply to comment: ${error.response?.data?.error?.message || error.message}`
      );
      return false;
    }
  }

  async checkFollowStatus(pageId: string, igUserId: string): Promise<boolean> {
    // Note: Checking follow status requires extra permissions and specialized queries on Graph API.
    // Assuming true for MVP unless explicitly implemented via Instagram Graph API edge.
    this.logger.debug(`[MOCK] Assuming true for checkFollowStatus for User ${igUserId}`);
    return true;
  }
}

