import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { ChatParticipantRepository } from './chat.participant.repository';
import { Chat, ChatType } from './chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(ChatParticipantRepository)
    private chatParticipantRepository: ChatParticipantRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async createPrivate(idx: number, name: string, password: string) {
    if (!name) throw new NotFoundException('Name is required');
    if (!password) throw new NotFoundException('Password is required');

    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx "${idx}" not found`);

    const chat = await this.chatRepository.createPrivate(name, password);
    await this.chatParticipantRepository.createOwnerParticipant(chat, user);

    return chat;
  }

  async createPublic(idx: number, name: string): Promise<Chat> {
    if (!name) throw new NotFoundException('Name is required');

    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`User with idx "${idx}" not found`);

    const chat = await this.chatRepository.createPublic(name);
    await this.chatParticipantRepository.createOwnerParticipant(chat, user);
    return chat;
  }

  async getPrivateChats(): Promise<Chat[]> {
    return await this.chatRepository.find({
      where: { type: ChatType.PRIVATE },
    });
  }

  async getPublicChats(): Promise<Chat[]> {
    return await this.chatRepository.find({ where: { type: ChatType.PUBLIC } });
  }

  async getPrivatePublicChats(): Promise<Chat[]> {
    return await this.chatRepository.find({
      where: [{ type: ChatType.PRIVATE }, { type: ChatType.PUBLIC }],
    });
  }

  async getDM(idx1: number, idx2: number): Promise<Chat> {
    const user1 = await this.userRepository.findOne({
      where: { idx: idx1 },
    });
    if (!user1)
      throw new NotFoundException(`User with idx "${idx1}" not found`);
    const user2 = await this.userRepository.findOne({
      where: { idx: idx2 },
    });
    if (!user2)
      throw new NotFoundException(`User with idx "${idx2}" not found`);

    const DMChat = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.participants', 'participant')
      .where('chat.type = :type', { type: 'DM' })
      .andWhere('participant.user.idx IN (:idx1, :idx2)', {
        idx1: idx1,
        idx2: idx2,
      })
      .groupBy('chat.idx')
      .having('COUNT(participant.user.idx) = 2')
      .getOne();

    console.log(DMChat);
    if (DMChat) return DMChat;

    const participant1 =
      await this.chatParticipantRepository.createUserParticipant(user1);
    const participant2 =
      await this.chatParticipantRepository.createUserParticipant(user2);

    return await this.chatRepository.createDM(participant1, participant2);
  }

  async deleteChat(idx: number): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { idx } });
    if (!chat) throw new NotFoundException(`Chat with idx "${idx}" not found`);

    // await this.chatParticipantRepository.delete({
    //   chat: { idx },
    // });
    await this.chatRepository.remove(chat);
  }
}
