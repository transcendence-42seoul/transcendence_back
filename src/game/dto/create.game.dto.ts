import { IsInt, IsNotEmpty } from 'class-validator';
import { GameModeType } from '../entities/game.entity';
import { User } from 'src/user/user.entity';
export class CreateGameDto {
  @IsNotEmpty()
  game_mode: GameModeType;

  @IsNotEmpty()
  @IsInt()
  player1: User;

  @IsNotEmpty()
  @IsInt()
  player2: User;
}
