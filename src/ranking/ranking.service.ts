import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RankingRepository } from './ranking.repository';
import { UserRepository } from '../user/user.repository';
import { Ranking } from './ranking.entity';
import { MoreThanOrEqual } from 'typeorm';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(RankingRepository)
    private rankingRepository: RankingRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async createRanking(): Promise<Ranking> {
    return this.rankingRepository.createRanking();
  }

  async getRanking(idx: number): Promise<Ranking> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx "${idx}" not found`);

    const ranking = user.ranking;
    if (!ranking)
      throw new NotFoundException(`Ranking with idx "${idx}" not found`);

    return ranking;
  }

  async getRankByIdx(idx: number): Promise<number> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx "${idx}" not found`);
    const ranking = user.ranking;
    if (!ranking)
      throw new NotFoundException(`User ${idx}'s ranking not found`);

    const userScore = ranking.score;
    const higherScoreCount = await this.rankingRepository.count({
      where: {
        score: MoreThanOrEqual(userScore),
      },
    });
    return higherScoreCount;
  }

  async updateRankingScore(idx: number, score: number): Promise<Ranking> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx "${idx}" not found`);

    const ranking = user.ranking;
    if (!ranking)
      throw new NotFoundException(`Ranking with idx "${idx}" not found`);

    ranking.score = score;
    await this.rankingRepository.save(ranking);
    return ranking;
  }

  async getAllRank(): Promise<Ranking[]> {
    return await this.rankingRepository
      .createQueryBuilder('ranking')
      .innerJoin('ranking.user', 'user')
      .select(['user.idx', 'ranking.score'])
      .addSelect('RANK() OVER (ORDER BY ranking.score DESC)', 'rank')
      .getRawMany();
  }
}
