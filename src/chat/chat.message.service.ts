import { Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { ChatMessage } from './chat.message.entity';
import { CreateMessageDto } from './dto/message.dto';
import { ChatMessageRepository } from './chat.message.repository';

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
    createMessageDto: CreateMessageDto,
  ): Promise<ChatMessage> {
    return this.chatMessageRepository.createChatMessage(createMessageDto);
  }

  async getChatMessages(chatIdx: number): Promise<CreateMessageDto[]> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new Error('채팅방이 존재하지 않습니다.');
    }

    const messages = chat.messages;
    const messageDtos: CreateMessageDto[] = [];
    for (const message of messages) {
      const messageData = message;

      const user = await this.userRepository.findOne({
        where: { idx: message.user.idx },
      });
      if (!user) messageData.user = undefined;

      const messageDto = CreateMessageDto.convertDto(message);

      messageDtos.push(messageDto);
    }

    return messageDtos;
  }
}
