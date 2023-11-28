import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingRepository } from './ranking.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranking } from './ranking.entity';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Ranking])],
  controllers: [RankingController],
  providers: [RankingService, RankingRepository, UserRepository],
  exports: [RankingRepository, RankingService],
})
export class RankingModule {}
