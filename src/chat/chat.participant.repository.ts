import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ChatParticipant, Role } from './chat.participant.entity';
import { Chat } from './chat.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class ChatParticipantRepository extends Repository<ChatParticipant> {
  constructor(dataSource: DataSource) {
    super(ChatParticipant, dataSource.createEntityManager());
  }

  async createUserParticipant(user: User): Promise<ChatParticipant> {
    const participant = this.create({
      user,
      role: Role.USER,
    });
    return await this.save(participant);
  }

  async createOwnerParticipant(
    chat: Chat,
    user: User,
  ): Promise<ChatParticipant> {
    const chatParticipant = this.create({
      chat,
      user,
      role: Role.OWNER,
    });
    await this.save(chatParticipant);
    return chatParticipant;
  }

  async createParticipant(chat: Chat, user: User): Promise<ChatParticipant> {
    const chatParticipant = this.create({
      chat,
      user,
      role: Role.USER,
    });
    await this.save(chatParticipant);
    return chatParticipant;
  }
}
