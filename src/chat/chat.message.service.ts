import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { ChatMessage } from './chat.message.entity';
import { ChatMessageRepository } from './chat.message.repository';
import { Not, In } from 'typeorm';

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(ChatMessageRepository)
    private chatMessageRepository: ChatMessageRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async createChatMessage(
    chatIdx: number,
    userIdx: number,
    content: string,
  ): Promise<ChatMessage> {
    return this.chatMessageRepository.createChatMessage(
      chatIdx,
      userIdx,
      content,
    );
  }

  async getChatMessages(
    chatIdx: number,
    userIdx: number,
  ): Promise<ChatMessage[]> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }
    const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    if (!user) {
      throw new NotFoundException(`User with idx "${userIdx}" not found`);
    }

    const blockedUsers = user.blocker;

    const chatMessages = await this.chatMessageRepository.find({
      where: {
        chat: { idx: chatIdx },
        user: { idx: Not(In(blockedUsers.map((bu) => bu.blocked))) },
      },
      relations: ['user'],
    });

    return chatMessages;
  }
}
