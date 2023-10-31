import { Controller, Get, Param } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { Ranking } from './ranking.entity';

@Controller('rankings')
export class RankingController {
  constructor(private rankingService: RankingService) {}

  @Get('/:idx')
  getRanking(@Param('idx') idx: number): Promise<Ranking> {
    return this.rankingService.getRanking(idx);
  }

  @Get('/:idx/rank')
  getRank(@Param('idx') idx: number): Promise<number> {
    return this.rankingService.getRankByIdx(idx);
  }

  @Get('/')
  getAllRanking(): Promise<Ranking[]> {
    return this.rankingService.getAllRank();
  }
}
