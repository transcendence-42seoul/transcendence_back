import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { MiniChatModule } from 'src/mini-chat/miniChat.module';
import { UserModule } from 'src/user/user.module';
import { GameRepository } from './game.repository';
import { RecordModule } from 'src/record/record.module';

@Module({
  imports: [MiniChatModule, UserModule, RecordModule],
  providers: [GameGateway, GameService, GameRepository],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
