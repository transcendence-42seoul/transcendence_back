import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ChatMessage } from './chat.message.entity';
import { CreateMessageDto } from './dto/message.dto';

@Injectable()
export class ChatMessageRepository extends Repository<ChatMessage> {
  constructor(dataSource: DataSource) {
    super(ChatMessage, dataSource.createEntityManager());
  }

  async createChatMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<ChatMessage> {
    const { content, user_idx, chat_idx, send_at } = createMessageDto;

    const message = this.create({
      content,
      user: { idx: user_idx },
      chat: { idx: chat_idx },
      send_at,
    });

    await this.save(message);
    return message;
  }
}
