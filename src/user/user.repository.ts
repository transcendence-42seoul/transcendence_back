import { Injectable } from '@nestjs/common';
import { User, UserStatus } from './user.entity';
import { UserDto } from './dto/user.dto';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  async createUser(userDto: UserDto): Promise<User> {
    const { id, nickname, email } = userDto;
    const user = this.create({
      id,
      nickname,
      email,
      status: UserStatus.OFFLINE,
      mfa_enabled: false,
    });
    await this.save(user);
    return user;
  }
}
