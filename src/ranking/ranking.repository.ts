import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Ranking } from './ranking.entity';

@Injectable()
export class RankingRepository extends Repository<Ranking> {
  constructor(dataSource: DataSource) {
    super(Ranking, dataSource.createEntityManager());
  }

  async createRanking(user_idx: number): Promise<Ranking> {
    const ranking = this.create({
      user_idx,
      score: 1000,
    });

    await this.save(ranking);

    return ranking;
  }
}
