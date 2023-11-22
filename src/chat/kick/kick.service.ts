import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRepository } from '../chat.repository';
import { ChatParticipantRepository } from '../chat.participant.repository';
import { Role } from '../chat.participant.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class KickService {
  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(ChatParticipantRepository)
    private chatParticipantRepository: ChatParticipantRepository,
  ) {}

  async kickParticipant(chatIdx: number, kickerIdx: number, kickedIdx: number) {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }
    const kicker = await this.chatParticipantRepository.findOne({
      where: { user: { idx: kickerIdx } },
      relations: ['user'],
    });
    if (!kicker) {
      throw new NotFoundException(`User with idx "${kickerIdx}" not found`);
    }
    const kicked = await this.chatParticipantRepository.findOne({
      where: { user: { idx: kickedIdx } },
      relations: ['user'],
    });
    if (!kicked) {
      throw new NotFoundException(`User with idx "${kickedIdx}" not found`);
    }

    const owners = await this.chatParticipantRepository.find({
      where: { chat: { idx: chatIdx }, role: Role.OWNER },
      relations: ['user'],
    });
    const ownerIdxs = owners.map((owner) => owner.user.idx);

    if (!ownerIdxs.includes(kicker.user.idx)) {
      throw new BadRequestException('You are not owner of this chat');
    }
    if (ownerIdxs.includes(kicked.user.idx)) {
      throw new BadRequestException('You cannot kick owner of this chat');
    }

    await this.chatParticipantRepository.remove(kicked);
    chat.currentParticipant--;
    await this.chatRepository.save(chat);
  }
}
