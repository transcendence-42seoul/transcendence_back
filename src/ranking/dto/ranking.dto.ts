import { IsNotEmpty } from 'class-validator';

export class RankingDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  score: number;

  static convertDto(userData: any): RankingDto {
    const rankingDto = new RankingDto();
    rankingDto.id = userData.login;
    rankingDto.score = 1000;

    return rankingDto;
  }
}
