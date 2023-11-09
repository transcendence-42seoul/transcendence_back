import { IsInt, IsNotEmpty, IsBoolean } from 'class-validator';
export class GameDto {
  @IsNotEmpty()
  @IsInt()
  game_idx: number;

  @IsNotEmpty()
  @IsInt()
  mode: number;

  @IsNotEmpty()
  @IsBoolean()
  game_status: boolean;

  @IsNotEmpty()
  @IsInt()
  gameHost: number;

  @IsNotEmpty()
  @IsInt()
  gameGuest: number;

  @IsNotEmpty()
  start_time: Date;

  @IsNotEmpty()
  end_time: Date;

  @IsNotEmpty()
  @IsInt()
  gameHost_score: number;

  @IsNotEmpty()
  @IsInt()
  gameGuest_score: number;

  static convertDto(userData: any): GameDto {
    const gameDto = new GameDto();

    gameDto.game_idx = userData.idx;
    gameDto.gameHost = userData.gameHost;
    gameDto.gameGuest = userData.gameGuest;
    gameDto.start_time = userData.start_time;
    gameDto.end_time = userData.end_time;
    gameDto.gameHost_score = userData.gameHost_score;
    gameDto.gameGuest_score = userData.gameGuest_score;

    return gameDto;
  }
}
