import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Avatar } from './avatar.entity';

@Injectable()
export class AvatarRepository extends Repository<Avatar> {
  constructor(dataSource: DataSource) {
    super(Avatar, dataSource.createEntityManager());
  }

  async createAvatar(user_idx: number): Promise<Avatar> {
    const avatar = this.create({
      user_idx,
    });

    await this.save(avatar);
    return avatar;
  }
}
