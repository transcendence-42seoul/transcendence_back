import { Controller, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { RankingDto } from './dto/ranking.dto';
import { Ranking } from './ranking.entity';

@Controller('rankings')
export class RankingController {
  constructor(private rankingService: RankingService) {}

  @Get('/:idx')
  getRankingByUserId(@Param('idx') idx: number): Promise<Ranking> {
    return this.rankingService.getRankingByUserId(idx);
  }

  @Patch('/:idx')
  updateRankingByUserId(
    @Param('idx') idx: number,
    @Body() updateRankingDto: RankingDto,
  ): Promise<Ranking> {
    return this.rankingService.updateRankingByUserId(idx, updateRankingDto);
  }

  @Delete('/:idx')
  deleteRankingByUserId(@Param('idx') idx: number): Promise<void> {
    return this.rankingService.deleteRankingByUserId(idx);
  }
}
