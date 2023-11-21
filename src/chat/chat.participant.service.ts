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

@Injectable()
export class ChatParticipantService {
  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(ChatParticipantRepository)
    private chatParticipantRepository: ChatParticipantRepository,
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

    const participant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: userIdx }, chat: { idx: chatIdx } },
    });
    if (participant)
      throw new NotFoundException(
        `User with idx "${userIdx}" already joined chat with idx "${chatIdx}"`,
      );

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
}
