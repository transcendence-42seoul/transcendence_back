import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ChatMessage } from './chat.message.entity';

@Injectable()
export class ChatMessageRepository extends Repository<ChatMessage> {
  constructor(dataSource: DataSource) {
    super(ChatMessage, dataSource.createEntityManager());
  }
}
