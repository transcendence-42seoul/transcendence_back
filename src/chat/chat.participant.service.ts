import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { ChatParticipantRepository } from './chat.participant.repository';
import { ChatType } from './chat.entity';
import { ChatParticipant } from './chat.participant.entity';
import * as bcrypt from 'bcrypt';
import { Role } from './chat.participant.entity';
import { BanRepository } from './ban/ban.repository';

@Injectable()
export class ChatParticipantService {
  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(ChatParticipantRepository)
    private chatParticipantRepository: ChatParticipantRepository,
    @InjectRepository(BanRepository)
    private banRepository: BanRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async joinPrivateChat(
    userIdx: number,
    chatIdx: number,
    password: string,
  ): Promise<ChatParticipant> {
    const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    if (!user)
      throw new NotFoundException(`User with idx "${userIdx}" not found`);

    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat)
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    if (chat.type !== ChatType.PRIVATE)
      throw new NotFoundException(`Chat with idx "${chatIdx}" is not private`);

    const participant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: userIdx }, chat: { idx: chatIdx } },
    });
    if (participant)
      throw new NotFoundException(
        `User with idx "${userIdx}" already joined chat with idx "${chatIdx}"`,
      );

    // ban (check with chat)
    await this.checkBan(userIdx, chatIdx);
    // block (check with blocker)
    await this.checkBlock(userIdx, chatIdx);

    if (!(await bcrypt.compare(password, chat.password)))
      throw new NotFoundException(`Password is incorrect`);

    if (chat.currentParticipant >= chat.limit)
      throw new BadRequestException(`Chat with idx "${chatIdx}" is full`);

    chat.currentParticipant++;

    await this.chatRepository.save(chat);

    return await this.chatParticipantRepository.createParticipant(chat, user);
  }

  async joinPublicChat(
    userIdx: number,
    chatIdx: number,
  ): Promise<ChatParticipant> {
    const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    if (!user)
      throw new NotFoundException(`User with idx "${userIdx}" not found`);
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat)
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    if (chat.type !== ChatType.PUBLIC)
      throw new NotFoundException(`Chat with idx "${chatIdx}" is not public`);

    // ban (check with chat)
    const bannedParticipant = await this.banRepository.find({
      where: { chat: { idx: chatIdx } },
      relations: ['banned'],
    });

    const isBanned = bannedParticipant.some(
      (ban) => ban.banned.idx === userIdx,
    );
    if (isBanned) {
      throw new BadRequestException(
        `User "${userIdx}" are banned in this chat`,
      );
    }

    // block (check with blocker)
    const owner = await this.chatParticipantRepository.findOne({
      where: { chat: { idx: chatIdx }, role: Role.OWNER },
      relations: ['user'],
    });

    const participant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: userIdx }, chat: { idx: chatIdx } },
    });
    if (participant)
      throw new NotFoundException(
        `User with idx "${userIdx}" already joined chat with idx "${chatIdx}"`,
      );

    const blockByOwner = owner.user.blocker;
    for (let i = 0; i < blockByOwner.length; i++) {
      if (blockByOwner[i].blocked === user.idx) {
        throw new BadRequestException(`You are blocked by owner`);
      }
    }

    const blockByParticipant = user.blocker;
    for (let i = 0; i < blockByParticipant.length; i++) {
      if (blockByParticipant[i].blocked === owner.user.idx) {
        throw new BadRequestException(`You are blocked by participant`);
      }
    }

    if (chat.currentParticipant >= chat.limit)
      throw new BadRequestException(`Chat with idx "${chatIdx}" is full`);

    chat.currentParticipant++;

    await this.chatRepository.save(chat);

    return await this.chatParticipantRepository.createParticipant(chat, user);
  }

  async getChatParticipants(chatIdx: number): Promise<ChatParticipant[]> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat)
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);

    return await this.chatParticipantRepository.find({
      where: { chat: { idx: chatIdx } },
      relations: ['user'],
    });
  }

  async leaveChat(userIdx: number, chatIdx: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    if (!user)
      throw new NotFoundException(`User with idx "${userIdx}" not found`);
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat)
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    const chatParticipant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: userIdx }, chat: { idx: chatIdx } },
      relations: ['user'],
    });
    if (!chatParticipant)
      throw new NotFoundException(
        `Participant with idx "${userIdx}" not found in chat "${chatIdx}"`,
      );

    await this.chatParticipantRepository.remove(chatParticipant);
    chat.currentParticipant--;
    await this.chatRepository.save(chat);
  }

  async checkBan(chatIdx: number, userIdx: number): Promise<void> {
    const bannedUsers = await this.banRepository.find({
      where: { chat: { idx: chatIdx } },
      relations: ['banned'],
    });

    const isBanned = bannedUsers.some((ban) => ban.banned.idx === userIdx);
    if (isBanned) {
      throw new BadRequestException(
        `User "${userIdx}" are banned in this chat`,
      );
    }
  }

  async checkBlock(userIdx: number, chatIdx: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    if (!user)
      throw new NotFoundException(`User with idx "${userIdx}" not found`);

    const owner = await this.chatParticipantRepository.findOne({
      where: { chat: { idx: chatIdx }, role: Role.OWNER },
      relations: ['user'],
    });

    const blockByOwner = owner.user.blocker;
    for (let i = 0; i < blockByOwner.length; i++) {
      if (blockByOwner[i].blocked === user.idx) {
        throw new BadRequestException(`You are blocked by owner`);
      }
    }

    const blockByParticipant = user.blocker;
    for (let i = 0; i < blockByParticipant.length; i++) {
      if (blockByParticipant[i].blocked === owner.user.idx) {
        throw new BadRequestException(`You are blocked by participant`);
      }
    }
  }
}
