import { IsInt, IsNotEmpty } from 'class-validator';
import { GameModeType } from '../entities/game.entity';

export class CreateGameDto {
  @IsNotEmpty()
  game_mode: GameModeType;

  @IsNotEmpty()
  @IsInt()
  player1: number;

  @IsNotEmpty()
  @IsInt()
  player2: number;
}
