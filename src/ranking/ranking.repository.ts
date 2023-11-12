import { DataSource, Repository } from 'typeorm';
import { Ranking } from './ranking.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RankingRepository extends Repository<Ranking> {
  constructor(dataSource: DataSource) {
    super(Ranking, dataSource.createEntityManager());
  }

  async createRanking(): Promise<Ranking> {
    const ranking = this.create({
      score: 1000,
    });

    await this.save(ranking);
    return ranking;
  }
}
