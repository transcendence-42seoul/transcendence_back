import { Injectable } from '@nestjs/common';
import { User, UserStatus } from './user.entity';
import { UserDto } from './dto/user.dto';
import { DataSource, Repository } from 'typeorm';
import { Avatar } from 'src/avatar/avatar.entity';
import { Ranking } from 'src/ranking/ranking.entity';
import { Record } from 'src/record/record.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async createUser(
    userDto: UserDto,
    avatar: Avatar,
    ranking: Ranking,
    record: Record,
  ): Promise<User> {
    const { id, nickname, email } = userDto;
    const user = this.create({
      id,
      nickname,
      email,
      status: UserStatus.OFFLINE,
      tfa_enabled: false,
      avatar,
      ranking,
      record,
    });
    await this.save(user);
    return user;
  }
}
