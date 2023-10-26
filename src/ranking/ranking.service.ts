import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RankingRepository } from './ranking.repository';
import { RankingDto } from './dto/ranking.dto';
import { UserRepository } from '../user/user.repository';
import { Ranking } from './ranking.entity';

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

  async getRankingByUserId(idx: number): Promise<Ranking> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx "${idx}" not found`);

    const ranking = user.ranking;
    if (!ranking)
      throw new NotFoundException(`Ranking with idx "${idx}" not found`);

    return ranking;
  }

  async updateRankingByUserId(
    idx: number,
    updateRankingDto: RankingDto,
  ): Promise<Ranking> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx "${idx}" not found`);

    const ranking = user.ranking;
    if (!ranking)
      throw new NotFoundException(`Ranking with idx "${idx}" not found`);

    try {
      if (
        !updateRankingDto ||
        !updateRankingDto.rank ||
        !updateRankingDto.score
      )
        throw new BadRequestException('Invalid updateRankingDto provided');
      ranking.rank = updateRankingDto.rank;
      ranking.score = updateRankingDto.score;

      return this.rankingRepository.save(ranking);
    } catch (error) {
      return error;
    }
  }

  async deleteRankingByUserId(idx: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx "${idx}" not found`);

    const ranking = user.ranking;
    if (!ranking)
      throw new NotFoundException(`Ranking with idx "${idx}" not found`);

    const result = await this.rankingRepository.delete({ idx });

    if (result.affected === 0) {
      throw new NotFoundException(`Ranking with idx "${idx}" not found`);
    }
  }
}
