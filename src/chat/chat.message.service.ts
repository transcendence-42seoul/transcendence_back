import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { ChatMessage } from './chat.message.entity';
import { ChatMessageRepository } from './chat.message.repository';
import { Not, In } from 'typeorm';
import { MuteRepository } from './mute/mute.repository';
import { ChatParticipantRepository } from './chat.participant.repository';

@Injectable()
export class ChatMessageService {
  constructor(
    @InjectRepository(ChatRepository)
    private chatRepository: ChatRepository,
    @InjectRepository(ChatParticipantRepository)
    private chatParticipantRepository: ChatParticipantRepository,
    @InjectRepository(ChatMessageRepository)
    private chatMessageRepository: ChatMessageRepository,
    @InjectRepository(MuteRepository)
    private muteRepository: MuteRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async createChatMessage(
    chatIdx: number,
    userIdx: number,
    content: string,
  ): Promise<ChatMessage> {
    const chat = await this.chatRepository.findOne({ where: { idx: chatIdx } });
    if (!chat) {
      throw new NotFoundException(`Chat with idx "${chatIdx}" not found`);
    }
    const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    if (!user)
      throw new NotFoundException(`User with idx "${userIdx}" not found`);

    // user가 해당 chatidx에 들어가있어야 함
    const userParticipant = await this.chatParticipantRepository.findOne({
      where: { user: { idx: userIdx }, chat: { idx: chatIdx } },
    });
    if (!userParticipant) {
      throw new NotFoundException(
        `Participant with idx "${userIdx}" not found in chat "${chatIdx}"`,
      );
    }

    const muteList = await this.muteRepository.find({
      where: { chat: { idx: chatIdx } },
      relations: ['muted'],
    });

    const now = new Date();
    if (muteList) {
      for (const mute of muteList) {
        if (mute.muted.idx === userIdx && mute.unmute_timestamp > now) {
          console.log('mute:', mute.muted.id, 'userIdx:', userIdx);
          throw new BadRequestException(
            `User with idx "${userIdx}" is muted in chat "${chatIdx}"`,
          );
        }
      }
    }

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

    const chatMessages = await this.chatMessageRepository
      .createQueryBuilder('chatMessage')
      .leftJoinAndSelect('chatMessage.user', 'user')
      .select(['chatMessage', 'user.idx', 'user.nickname'])
      .where('chatMessage.chat.idx = :chatIdx', { chatIdx })
      .orderBy('chatMessage.send_at', 'ASC')
      .getMany();

    return chatMessages;
  }
}
