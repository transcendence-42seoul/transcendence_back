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
import { ChatMemberDto } from './dto/chat.member.dto';

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
  ): Promise<void> {
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
    // await this.checkBlock(userIdx, chatIdx);

    if (!(await bcrypt.compare(password, chat.password))) {
      throw new NotFoundException(`Password is incorrect`);
    }

    if (chat.currentParticipant >= chat.limit)
      throw new BadRequestException(`Chat with idx "${chatIdx}" is full`);

    chat.currentParticipant++;

    await this.chatRepository.save(chat);

    await this.chatParticipantRepository.createParticipant(chat, user);
  }

  async joinPublicChat(userIdx: number, chatIdx: number): Promise<void> {
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
    // const owner = await this.chatParticipantRepository.findOne({
    //   where: { chat: { idx: chatIdx }, role: Role.OWNER },
    //   relations: ['user'],
    // });

    const participant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: userIdx }, chat: { idx: chatIdx } },
    });
    if (participant)
      throw new NotFoundException(
        `User with idx "${userIdx}" already joined chat with idx "${chatIdx}"`,
      );

    // const blockByOwner = owner.user.blocker;
    // for (let i = 0; i < blockByOwner.length; i++) {
    //   if (blockByOwner[i].blocked === user.idx) {
    //     throw new BadRequestException(`You are blocked by owner`);
    //   }
    // }

    if (chat.currentParticipant >= chat.limit)
      throw new BadRequestException(`Chat with idx "${chatIdx}" is full`);

    chat.currentParticipant++;

    await this.chatRepository.save(chat);

    await this.chatParticipantRepository.createParticipant(chat, user);
  }

  async getChatParticipants(chatIdx: number): Promise<ChatMemberDto[]> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat)
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);

    const participants = await this.chatParticipantRepository.find({
      where: { chat: { idx: chatIdx } },
      relations: ['user'],
    });

    return participants.map((participant) => ({
      idx: participant.idx,
      role: participant.role,
      user: {
        idx: participant.user.idx,
        nickname: participant.user.nickname,
      },
      isHighlighted: false,
    }));
  }

  async isParticipant(chatIdx: number, userIdx: number): Promise<boolean> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat)
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    if (!user)
      throw new NotFoundException(`User with idx "${userIdx}" not found`);

    const participant = await this.chatParticipantRepository.findOne({
      where: { chat: { idx: chatIdx }, user: { idx: userIdx } },
    });
    if (participant) return true;
    return false;
  }

  async getChatOwner(chatIdx: number): Promise<ChatParticipant> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat)
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);

    return await this.chatParticipantRepository.findOne({
      where: { chat: { idx: chatIdx }, role: Role.OWNER },
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
  }

  async updateRole(
    userIdx: number,
    chatIdx: number,
    role: Role,
  ): Promise<void> {
    const participant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: userIdx }, chat: { idx: chatIdx } },
    });
    if (!participant)
      throw new NotFoundException(
        `Participant with idx "${userIdx}" not found in chat "${chatIdx}"`,
      );

    participant.role = role;

    await this.chatParticipantRepository.save(participant);
  }
}
