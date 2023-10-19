import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AvatarRepository } from '../avatar/avatar.repository';
import { RecordRepository } from '../record/record.repository';
import { RankingRepository } from '../ranking/ranking.repository';
import { UserDto } from './dto/user.dto';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TFASecret, User, UserStatus } from './user.entity';

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
      const avatar = await this.avatarRepository.createAvatar();
      const ranking = await this.rankingRepository.createRanking();
      const record = await this.recordRepository.createRecord();

      const user = await this.userRepository.createUser(
        userDto,
        avatar,
        ranking,
        record,
      );

      await this.userRepository.save(user);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async deleteAll(): Promise<void> {
    const user = await this.userRepository.find({});
    for (let i = 0; i < user.length; i++) {
      await this.avatarRepository.remove(user[i].avatar);
      await this.rankingRepository.remove(user[i].ranking);
      await this.recordRepository.remove(user[i].record);
      await this.userRepository.remove(user[i]);
    }
  }

  async deleteByIdx(idx: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx ${idx} not found`);

    await this.avatarRepository.remove(user.avatar);
    await this.rankingRepository.remove(user.ranking);
    await this.recordRepository.remove(user.record);
    await this.userRepository.remove(user);
  }

  async findIdx(idx: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ idx });

    if (!user) throw new NotFoundException(`User with idx ${idx} not found`);

    return user;
  }

  async findId(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return user;
  }

  async updateProfile(idx: number, userDto: UserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx ${idx} not found`);

    try {
      if (!userDto || !userDto.nickname || !userDto.email) {
        throw new BadRequestException('Invalid userDto provided');
      }

      if (userDto.nickname !== undefined) user.nickname = userDto.nickname;
      if (userDto.email !== undefined) user.email = userDto.email;

      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
    return user;
  }

  async updateStatus(idx: number, status: UserStatus): Promise<User> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`user with idx ${idx} not found`);

    user.status = status;

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
    return user;
  }

  async updateTFA(
    idx: number,
    tfa_enabled: boolean,
    tfa_secret: TFASecret,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx ${idx} not found`);

    try {
      user.tfa_enabled = tfa_enabled;
      user.tfa_secret = tfa_secret;

      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }
}
