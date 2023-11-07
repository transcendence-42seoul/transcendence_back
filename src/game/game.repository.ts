import { DataSource, Repository } from 'typeorm';
import { GameModeType, Game } from './entities/game.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameRepository extends Repository<Game> {
  constructor(dataSource: DataSource) {
    super(Game, dataSource.createEntityManager());
  }

  async createGame(
    game_mode: GameModeType,
    player1: number,
    player2: number,
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
