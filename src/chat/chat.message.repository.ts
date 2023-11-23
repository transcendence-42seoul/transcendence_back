import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ChatMessage } from './chat.message.entity';

@Injectable()
export class ChatMessageRepository extends Repository<ChatMessage> {
  constructor(dataSource: DataSource) {
    super(ChatMessage, dataSource.createEntityManager());
  }

  async createChatMessage(
    chatIdx: number,
    userIdx: number,
    content: string,
  ): Promise<ChatMessage> {
    const message = this.create({
      content,
      user: { idx: userIdx },
      chat: { idx: chatIdx },
    });

    await this.save(message);
    return message;
  }
}
