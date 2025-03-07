import { Test, TestingModule } from '@nestjs/testing';
import { LogEventsService } from './log-events.service';

describe('LogEventsService', () => {
  let service: LogEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogEventsService],
    }).compile();

    service = module.get<LogEventsService>(LogEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
