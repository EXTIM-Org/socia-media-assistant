import { Module } from '@nestjs/common';
import { FsmService } from './fsm.service.js';

@Module({
  providers: [FsmService],
  exports: [FsmService]
})
export class FsmModule {}
