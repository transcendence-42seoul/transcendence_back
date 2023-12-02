import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRepository } from '../chat.repository';
import { ChatParticipantRepository } from '../chat.participant.repository';
import { UserRepository } from 'src/user/user.repository';
import { Role } from '../chat.participant.entity';
import { BadRequestException } from '@nestjs/common';
import { ChatParticipantService } from '../chat.participant.service';
import { In } from 'typeorm';

@Injectable()
export class KickService {
  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(ChatParticipantRepository)
    private chatParticipantRepository: ChatParticipantRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private chatParticipantService: ChatParticipantService,
  ) {}

  async kickParticipant(chatIdx: number, kickerIdx: number, kickedIdx: number) {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }

    // 유저 존재하는지 확인
    const kicker = await this.userRepository.findOne({
      where: { idx: kickerIdx },
    });
    if (!kicker) {
      throw new NotFoundException(`User with idx "${kickerIdx}" not found`);
    }
    const kicked = await this.userRepository.findOne({
      where: { idx: kickedIdx },
    });
    if (!kicked) {
      throw new NotFoundException(`User with idx "${kickedIdx}" not found`);
    }
    // kicker, kicked가 해당 chatidx에 들어가있어야 함
    const kickerParticipant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: kickerIdx } },
      relations: ['user'],
    });
    if (!kickerParticipant) {
      throw new NotFoundException(
        `Participant with idx "${kickerIdx}" not found in chat "${chatIdx}"`,
      );
    }
    const kickedParticipant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: kickedIdx } },
      relations: ['user'],
    });
    if (!kickedParticipant) {
      throw new NotFoundException(
        `Participant with idx "${kickedIdx}" not found in chat "${chatIdx}"`,
      );
    }

    const managers = await this.chatParticipantRepository.find({
      where: { chat: { idx: chatIdx }, role: In([Role.OWNER, Role.ADMIN]) },
      relations: ['user'],
    });
    const managersIdx = managers.map((manager) => manager.user.idx);

    if (!managersIdx.includes(kickerIdx)) {
      throw new BadRequestException('You are not manager of this chat');
    }
    if (managersIdx.includes(kickedIdx)) {
      throw new BadRequestException('You cannot kick manager of this chat');
    }

    await this.chatParticipantService.leaveChat(kickedIdx, chatIdx);
  }
}
