import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AvatarRepository } from '../avatar/avatar.repository';
import { RecordRepository } from '../record/record.repository';
import { RankingRepository } from '../ranking/ranking.repository';
import { UserDto } from './dto/user.dto';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(RankingRepository)
    private rankingRepository: RankingRepository,
    @InjectRepository(RecordRepository)
    private recordRepository: RecordRepository,
    @InjectRepository(AvatarRepository)
    private avatarRepository: AvatarRepository,
  ) {}

  async findOrCreateUser(userData: any): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userData.login },
    });
    if (user) return user;
    else {
      const userDto = UserDto.convertDto(userData);

      return await this.signup(userDto);
    }
  }

  async signup(userDto: UserDto): Promise<User> {
    try {
      const user = await this.userRepository.createUser(userDto);
      await this.rankingRepository.createRanking(user.idx);
      await this.avatarRepository.createAvatar(user.idx);
      await this.recordRepository.createRecord(user.idx);

      return user;
    } catch (error) {
      throw error;
    }
  }
}
