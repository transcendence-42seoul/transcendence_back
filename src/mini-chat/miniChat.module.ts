import { Module } from '@nestjs/common';
import { MiniChatService } from './miniChat.service';
import { MiniChatGateway } from './miniChat.gateway';

@Module({
  providers: [MiniChatGateway, MiniChatService],
  exports: [MiniChatGateway, MiniChatService],
})
export class MiniChatModule {}
