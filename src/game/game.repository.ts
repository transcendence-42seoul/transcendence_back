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
    game_host: number,
    game_guest: number,
  ): Promise<Game> {
    const game = this.create({
      game_mode,
      game_status: true,
      start_time: new Date(),
      end_time: new Date(),
      game_host: { idx: game_host },
      game_guest: { idx: game_guest },
      gameHost_score: 0,
      gameGuest_score: 0,
    });
    await this.save(game);
    return game;
  }
}
