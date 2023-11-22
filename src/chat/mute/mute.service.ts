import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MuteRepository } from './mute.repository';
import { ChatRepository } from '../chat.repository';
import { ChatParticipantRepository } from '../chat.participant.repository';
import { Role } from '../chat.participant.entity';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/user/user.entity';

@Injectable()
export class MuteService {
  constructor(
    @InjectRepository(MuteRepository)
    private muteRepository: MuteRepository,
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(ChatParticipantRepository)
    private chatParticipantRepository: ChatParticipantRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async muteUser(
    chatIdx: number,
    muterIdx: number,
    mutedIdx: number,
  ): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }
    // 유저 존재하는지 확인
    const muter = await this.userRepository.findOne({
      where: { idx: muterIdx },
    });
    if (!muter) {
      throw new NotFoundException(`User with idx "${muterIdx}" not found`);
    }
    const muted = await this.userRepository.findOne({
      where: { idx: mutedIdx },
    });
    if (!muted) {
      throw new NotFoundException(`User with idx "${mutedIdx}" not found`);
    }
    // muter, muted가 해당 chatidx에 들어가있어야 함
    const muterParticipant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: muterIdx }, chat: { idx: chatIdx } },
    });
    if (!muterParticipant) {
      throw new NotFoundException(
        `Participant with idx "${muterIdx}" not found in chat "${chatIdx}"`,
      );
    }
    const mutedParticipant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: mutedIdx }, chat: { idx: chatIdx } },
      relations: ['user'],
    });
    if (!mutedParticipant) {
      throw new NotFoundException(
        `Participant with idx "${mutedIdx}" not found in chat "${chatIdx}"`,
      );
    }

    // 중복 검사
    const existMute = await this.muteRepository.findOne({
      where: {
        chat: { idx: chatIdx },
        muted: { idx: mutedIdx },
      },
    });
    if (existMute) {
      throw new BadRequestException(
        `Mute with muted "${mutedIdx}" in chat "${chatIdx}" already exist`,
      );
    }

    const owners = await this.chatParticipantRepository.find({
      where: { chat: { idx: chatIdx }, role: Role.OWNER },
      relations: ['user'],
    });
    const ownerIdxs = owners.map((owner) => owner.user.idx);
    if (!ownerIdxs.includes(muterIdx)) {
      throw new BadRequestException('You are not owner of this chat');
    }
    if (ownerIdxs.includes(mutedIdx)) {
      throw new BadRequestException('You cannot mute owner of this chat');
    }

    await this.muteRepository.createMute(chatIdx, mutedIdx);
  }

  async deleteMute(
    chatIdx: number,
    muterIdx: number,
    mutedIdx: number,
  ): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }
    const muter = await this.userRepository.findOne({
      where: { idx: muterIdx },
    });
    if (!muter) {
      throw new NotFoundException(`User with idx "${muterIdx}" not found`);
    }
    const muted = await this.userRepository.findOne({
      where: { idx: mutedIdx },
    });
    if (!muted) {
      throw new NotFoundException(`User with idx "${mutedIdx}" not found`);
    }

    const owners = await this.chatParticipantRepository.find({
      where: { chat: { idx: chatIdx }, role: Role.OWNER },
      relations: ['user'],
    });
    const ownerIdxs = owners.map((owner) => owner.user.idx);
    if (!ownerIdxs.includes(muterIdx)) {
      throw new BadRequestException('You are not owner of this chat');
    }
    if (ownerIdxs.includes(mutedIdx)) {
      throw new BadRequestException(
        'You cannot delete mute yourself of this chat',
      );
    }

    const mute = await this.muteRepository.findOne({
      where: {
        chat: { idx: chatIdx },
        muted: { idx: mutedIdx },
      },
    });
    if (!mute)
      throw new NotFoundException(
        `Mute with muted "${mutedIdx}" in chat "${chatIdx}" not found`,
      );
    await this.muteRepository.remove(mute);
  }

  async getMuteList(chatIdx: number): Promise<User[]> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }

    const mutedUsers = await this.muteRepository.find({
      where: { chat: { idx: chatIdx } },
      relations: ['muted'],
    });

    if (!mutedUsers || mutedUsers.length === 0) return [];

    const mutedList: User[] = [];
    for (const mutedUser of mutedUsers) {
      mutedList.push(mutedUser.muted);
    }

    return mutedList;
  }
}
