import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { UserModule } from 'src/user/user.module';
import { GameRepository } from './game.repository';
import { RecordModule } from 'src/record/record.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entities/game.entity';
import { RankingModule } from 'src/ranking/ranking.module';

@Module({
  imports: [
    UserModule,
    RecordModule,
    AuthModule,
    RankingModule,
    TypeOrmModule.forFeature([Game]),
  ],
  providers: [GameGateway, GameService, GameRepository],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}
