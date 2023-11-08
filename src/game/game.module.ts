import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { MiniChatModule } from 'src/mini-chat/miniChat.module';
import { UserModule } from 'src/user/user.module';
import { GameRepository } from './game.repository';

@Module({
  imports: [MiniChatModule, UserModule],
  providers: [GameGateway, GameService, GameRepository],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
