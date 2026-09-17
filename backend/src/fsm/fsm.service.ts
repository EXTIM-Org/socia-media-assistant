import { Injectable, Logger } from '@nestjs/common';

export enum UserState {
  IDLE = 'IDLE',
  AWAITING_NAME = 'AWAITING_NAME',
  AWAITING_ADDRESS = 'AWAITING_ADDRESS',
  AWAITING_PHONE = 'AWAITING_PHONE',
}

interface FsmSession {
  state: UserState;
  data: Record<string, any>;
}

@Injectable()
export class FsmService {
  private readonly logger = new Logger(FsmService.name);
  
  // MOCK: In-memory store instead of Redis for now
  private sessions = new Map<string, FsmSession>();

  async getUserSession(igUserId: string): Promise<FsmSession> {
    const session = this.sessions.get(igUserId);
    return session || { state: UserState.IDLE, data: {} };
  }

  async setUserSession(igUserId: string, state: UserState, data: Record<string, any> = {}): Promise<void> {
    this.logger.log(`Setting state for ${igUserId} to ${state}`);
    const currentSession = await this.getUserSession(igUserId);
    this.sessions.set(igUserId, {
      state,
      data: { ...currentSession.data, ...data }, // Merge new data
    });
  }

  async clearUserState(igUserId: string): Promise<void> {
    this.logger.log(`Clearing state for ${igUserId}`);
    this.sessions.delete(igUserId);
  }
}
