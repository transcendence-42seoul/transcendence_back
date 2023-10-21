import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { MiniChatModule } from 'src/mini-chat/miniChat.module';

@Module({
  imports: [MiniChatModule],
  providers: [GameGateway, GameService],
  controllers: [GameController],
})
export class GameModule {}
