import { IsInt, IsNotEmpty } from 'class-validator';
import { GameModeType } from '../entities/game.entity';
export class CreateGameDto {
  @IsNotEmpty()
  game_mode: GameModeType;

  @IsNotEmpty()
  @IsInt()
  gameHost: number;

  @IsNotEmpty()
  @IsInt()
  gameGuest: number;
}
