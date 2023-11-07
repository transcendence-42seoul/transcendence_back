import { IsInt, IsNotEmpty } from 'class-validator';
export class GameDto {
  @IsNotEmpty()
  @IsInt()
  game_idx: number;

  @IsNotEmpty()
  @IsInt()
  mode: number;

  @IsNotEmpty()
  @IsInt()
  player1: number;

  @IsNotEmpty()
  @IsInt()
  player2: number;

  @IsNotEmpty()
  start_time: Date;

  @IsNotEmpty()
  end_time: Date;

  @IsNotEmpty()
  @IsInt()
  player1_score: number;

  @IsNotEmpty()
  @IsInt()
  player2_score: number;

  static convertDto(userData: any): GameDto {
    const gameDto = new GameDto();

    gameDto.game_idx = userData.idx;
    gameDto.player1 = userData.player1;
    gameDto.player2 = userData.player2;
    gameDto.start_time = userData.start_time;
    gameDto.end_time = userData.end_time;
    gameDto.player1_score = userData.player1_score;
    gameDto.player2_score = userData.player2_score;

    return gameDto;
  }
}
