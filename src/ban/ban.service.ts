import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { BanRepository } from './ban.repository';
import { User } from 'src/user/user.entity';

@Injectable()
export class BanService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(BanRepository)
    private banRepository: BanRepository,
  ) {}

  async banUser(bannerIdx: number, bannedIdx: number): Promise<void> {
    const banner = await this.userRepository.findOne({
      where: { idx: bannerIdx },
    });
    if (!banner)
      throw new NotFoundException(`User with idx "${bannerIdx}" not found`);
    const banned = await this.userRepository.findOne({
      where: { idx: bannedIdx },
    });
    if (!banned)
      throw new NotFoundException(`User with idx "${bannedIdx}" not found`);

    const existBan = await this.banRepository.findOne({
      where: { banner: { idx: bannerIdx }, banned: bannedIdx },
    });
    if (existBan)
      throw new NotFoundException(
        `Ban with banner "${bannerIdx}" and banned "${bannedIdx}" already exist`,
      );

    const ban = await this.banRepository.create({ banner, banned: bannedIdx });
    await this.banRepository.save(ban);
  }

  async unBanUser(bannerIdx: number, bannedIdx: number): Promise<void> {
    const bannerUser = await this.userRepository.findOne({
      where: { idx: bannerIdx },
    });
    if (!bannerUser)
      throw new NotFoundException(`User with idx "${bannerIdx}" not found`);
    const bannedUser = await this.userRepository.findOne({
      where: { idx: bannedIdx },
    });
    if (!bannedUser)
      throw new NotFoundException(`User with idx "${bannedIdx}" not found`);

    const ban = await this.banRepository.findOne({
      where: { banner: { idx: bannerIdx }, banned: bannedIdx },
    });
    if (!ban)
      throw new NotFoundException(
        `Ban with banner "${bannerIdx}" and banned "${bannedIdx}" not found`,
      );

    await this.banRepository.remove(ban);
  }

  async getBanList(bannerIdx: number): Promise<User[]> {
    const bannerUser = await this.userRepository.findOne({
      where: { idx: bannerIdx },
    });
    if (!bannerUser)
      throw new NotFoundException(`User with idx "${bannerIdx}" not found`);

    const banList = bannerUser.banner;
    if (!banList || banList.length === 0) return [];

    const bannedList: User[] = [];
    for (const ban of banList) {
      const idx = ban.banned;
      const user = await this.userRepository.findOne({ where: { idx } });
      bannedList.push(user);
    }

    return bannedList;
  }
}
