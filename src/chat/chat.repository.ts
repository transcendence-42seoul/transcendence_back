import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Chat, ChatType } from './chat.entity';
import { ChatParticipant } from './chat.participant.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatRepository extends Repository<Chat> {
  constructor(dataSource: DataSource) {
    super(Chat, dataSource.createEntityManager());
  }

  async createDM(
    participant1: ChatParticipant,
    participant2: ChatParticipant,
  ): Promise<Chat> {
    const participants = [participant1, participant2];
    const chat = this.create({
      type: ChatType.DM,
      participants,
    });
    await this.save(chat);
    return chat;
  }

  async createPrivate(name: string, password: string): Promise<Chat> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const chat = this.create({
      name,
      type: ChatType.PRIVATE,
      password: hashedPassword,
    });
    await this.save(chat);
    return chat;
  }

  async createPublic(name: string): Promise<Chat> {
    const chat = this.create({
      name,
      type: ChatType.PUBLIC,
    });
    await this.save(chat);
    return chat;
  }
}
