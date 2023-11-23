import { Injectable } from '@nestjs/common';
import { Ban } from './ban.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BanRepository extends Repository<Ban> {
  constructor(dataSource: DataSource) {
    super(Ban, dataSource.createEntityManager());
  }

  async createBan(chatIdx: number, bannedIdx: number): Promise<Ban> {
    const ban = await this.create({
      chat: { idx: chatIdx },
      banned: { idx: bannedIdx },
    });

    await this.save(ban);
    return ban;
  }
}
