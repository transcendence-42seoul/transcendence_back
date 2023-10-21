import { Test, TestingModule } from '@nestjs/testing';
import { MiniChatGateway } from './miniChat.gateway';
import { MiniChatService } from './miniChat.service';

describe('ChatGateway', () => {
  let gateway: MiniChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MiniChatGateway, MiniChatService],
    }).compile();

    gateway = module.get<MiniChatGateway>(MiniChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
