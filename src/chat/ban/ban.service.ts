import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BanRepository } from './ban.repository';
import { ChatRepository } from '../chat.repository';
import { ChatParticipantRepository } from '../chat.participant.repository';
import { Role } from '../chat.participant.entity';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/user/user.entity';
import { ChatParticipantService } from '../chat.participant.service';
import { In } from 'typeorm';

@Injectable()
export class BanService {
  constructor(
    @InjectRepository(BanRepository)
    private banRepository: BanRepository,
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(ChatParticipantRepository)
    private chatParticipantRepository: ChatParticipantRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private chatParticipantService: ChatParticipantService,
  ) {}

  async banUser(
    chatIdx: number,
    bannerIdx: number,
    bannedIdx: number,
  ): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }
    // 유저 존재하는지 확인
    const banner = await this.userRepository.findOne({
      where: { idx: bannerIdx },
    });
    if (!banner) {
      throw new NotFoundException(`User with idx "${bannerIdx}" not found`);
    }
    const banned = await this.userRepository.findOne({
      where: { idx: bannedIdx },
    });
    if (!banned) {
      throw new NotFoundException(`User with idx "${bannedIdx}" not found`);
    }

    // banner, banned가 해당 chatidx에 들어가있어야 함
    const bannerParticipant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: bannerIdx }, chat: { idx: chatIdx } },
    });
    if (!bannerParticipant) {
      throw new NotFoundException(
        `Participant with idx "${bannerIdx}" not found in chat "${chatIdx}"`,
      );
    }
    const bannedParticipant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: bannedIdx }, chat: { idx: chatIdx } },
    });
    if (!bannedParticipant) {
      throw new NotFoundException(
        `Participant with idx "${bannedIdx}" not found in chat "${chatIdx}"`,
      );
    }

    // 중복 검사
    const existBan = await this.banRepository.findOne({
      where: {
        chat: { idx: chatIdx },
        banned: { idx: bannedIdx },
      },
    });
    if (existBan) {
      throw new BadRequestException(
        `Ban with banned "${bannedIdx}" in chat "${chatIdx}" already exist`,
      );
    }

    const managers = await this.chatParticipantRepository.find({
      where: { chat: { idx: chatIdx }, role: In([Role.OWNER, Role.ADMIN]) },
      relations: ['user'],
    });
    const managersIdx = managers.map((managers) => managers.user.idx);
    if (!managersIdx.includes(bannerIdx)) {
      throw new BadRequestException('You are not manager of this chat');
    }
    if (managersIdx.includes(bannedIdx)) {
      throw new BadRequestException('You cannot ban manager of this chat');
    }

    await this.banRepository.createBan(chatIdx, bannedIdx);

    await this.chatParticipantService.leaveChat(bannedIdx, chatIdx);
  }

  async deleteBan(
    chatIdx: number,
    bannerIdx: number,
    bannedIdx: number,
  ): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }
    const banner = await this.userRepository.findOne({
      where: { idx: bannerIdx },
    });
    if (!banner) {
      throw new NotFoundException(`User with idx "${bannerIdx}" not found`);
    }
    const banned = await this.userRepository.findOne({
      where: { idx: bannedIdx },
    });
    if (!banned) {
      throw new NotFoundException(`User with idx "${bannedIdx}" not found`);
    }

    const owners = await this.chatParticipantRepository.find({
      where: { chat: { idx: chatIdx }, role: Role.OWNER },
      relations: ['user'],
    });
    const ownerIdxs = owners.map((owner) => owner.user.idx);
    if (!ownerIdxs.includes(bannerIdx)) {
      throw new BadRequestException('You are not owner of this chat');
    }
    if (ownerIdxs.includes(bannedIdx)) {
      throw new BadRequestException(
        'You cannot delete ban yourself of this chat',
      );
    }

    const ban = await this.banRepository.findOne({
      where: {
        chat: { idx: chatIdx },
        banned: { idx: bannedIdx },
      },
    });
    if (!ban)
      throw new NotFoundException(
        `Ban with banned "${bannedIdx}" in chat "${chatIdx}" not found`,
      );
    await this.banRepository.remove(ban);
  }

  async getBanList(chatIdx: number): Promise<User[]> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }

    const bannedUsers = await this.banRepository.find({
      where: { chat: { idx: chatIdx } },
      relations: ['banned'],
    });

    if (!bannedUsers || bannedUsers.length === 0) return [];

    const bannedList: User[] = [];
    for (const bannedUser of bannedUsers) {
      bannedList.push(bannedUser.banned);
    }

    return bannedList;
  }
}
