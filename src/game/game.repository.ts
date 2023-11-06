import { DataSource, Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameRepository extends Repository<Game> {
  constructor(dataSource: DataSource) {
    super(Game, dataSource.createEntityManager());
  }

  async createGame(): Promise<Game> {
    const game = this.create();
    await this.save(game);
    return game;
  }

  //   async findGameByIdx(idx: number): Promise<Game> {
  //     return this.findOne(idx);
  //   }
}
