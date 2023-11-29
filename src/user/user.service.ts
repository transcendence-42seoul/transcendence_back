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
import { FriendRequestPairRepository } from 'src/friend/friend.request.pair.repository';
import { FriendRequestRepository } from 'src/friend/friend.request.repository';
import { BlockRepository } from 'src/block/block.repository';

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
    @InjectRepository(FriendRequestRepository)
    private friendRequestRepository: FriendRequestRepository,
    @InjectRepository(FriendRequestPairRepository)
    private friendRequestPairRepository: FriendRequestPairRepository,
    @InjectRepository(BlockRepository)
    private blockRepository: BlockRepository,
  ) {}

  async findOrCreateUser(
    userData: any,
  ): Promise<{ user: User; created: boolean }> {
    const user = await this.userRepository.findOne({
      where: { id: userData.login },
    });
    if (user) return { user, created: false };
    else {
      const userDto = UserDto.convertDto(userData);

      const newUser = await this.signup(userDto);
      return { user: newUser, created: true };
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

  async deleteByIdx(idx: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx ${idx} not found`);

    await this.userRepository.remove(user);
  }

  async deleteAll(): Promise<void> {
    const user = await this.userRepository.find({});
    for (let i = 0; i < user.length; i++) {
      this.deleteByIdx(user[i].idx);
    }
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['avatar', 'record', 'ranking'],
    });
  }

  async findByIdx(idx: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ idx });

    if (!user) throw new NotFoundException(`User with idx ${idx} not found`);

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return user;
  }

  async isNicknameUnique(nickname: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { nickname } });
    if (user) return false;
    return true;
  }

  async updateUsername(idx: number, nickname: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`user with idx ${idx} not found`);

    user.nickname = nickname;

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
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
  }

  async getStatusById(id: string): Promise<UserStatus> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['status'],
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user.status;
  }

  async getIsInclueGame(
    id: string,
  ): Promise<{ include: boolean; status: UserStatus }> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['host', 'guest', 'status'],
    });
    if (user.host || user.guest) return { include: true, status: user.status };
    return { include: true, status: user.status };
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
