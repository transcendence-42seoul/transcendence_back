import { IsNotEmpty, IsInt } from 'class-validator';

export class RankingDto {
  @IsInt()
  rank: number;

  @IsNotEmpty()
  @IsInt()
  score: number;

  static convertDto(userData: any): RankingDto {
    const rankingDto = new RankingDto();
    rankingDto.rank = userData.rank;
    rankingDto.score = userData.score;

    return rankingDto;
  }
}
