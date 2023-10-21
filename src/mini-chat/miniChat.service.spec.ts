import { Test, TestingModule } from '@nestjs/testing';
import { MiniChatService } from './miniChat.service';

describe('MiniChatService', () => {
  let service: MiniChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MiniChatService],
    }).compile();

    service = module.get<MiniChatService>(MiniChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
