import { DataSource, Repository } from 'typeorm';
import { GameModeType, Game } from './entities/game.entity';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/user/user.entity';

@Injectable()
export class GameRepository extends Repository<Game> {
  constructor(dataSource: DataSource) {
    super(Game, dataSource.createEntityManager());
  }

  async createGame(
    game_mode: GameModeType,
    player1: User,
    player2: User,
  ): Promise<Game> {
    const game = this.create({
      game_mode,
      start_time: new Date(),
      end_time: new Date(),
      player1,
      player2,
      player1_score: 0,
      player2_score: 0,
    });
    await this.save(game);
    return game;
  }
}
