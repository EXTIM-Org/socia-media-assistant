import { Test, TestingModule } from '@nestjs/testing';
import { FsmService } from './fsm.service.js';

describe('FsmService', () => {
  let service: FsmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FsmService],
    }).compile();

    service = module.get<FsmService>(FsmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
