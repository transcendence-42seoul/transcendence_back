import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';
import { RankingRepository } from './ranking.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ranking } from './ranking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ranking])],
  controllers: [RankingController],
  providers: [RankingService, RankingRepository],
  exports: [RankingRepository],
})
export class RankingModule {}
