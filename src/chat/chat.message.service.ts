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
import { MuteRepository } from './mute/mute.repository';
import { ChatParticipantRepository } from './chat.participant.repository';
import { BlockService } from 'src/block/block.service';

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
    private blockService: BlockService,
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

  async checkChatMessage(
    userIdx: number,
    chatMessage: ChatMessage,
  ): Promise<boolean> {
    const blockList = await this.blockService.getBlockList(userIdx);
    const blockIdxList = blockList.map((block) => block.idx);

    const blockedIdxList = await this.blockService.getBlockedList(userIdx);

    if (blockList.length > 0 && blockIdxList.includes(chatMessage.user.idx)) {
      return false;
    }
    if (
      blockedIdxList.length > 0 &&
      blockedIdxList.includes(chatMessage.user.idx)
    ) {
      return false;
    }
    return true;
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

    // const blockList = await this.blockService.getBlockList(userIdx);
    // const blockIdxList = blockList.map((block) => block.idx);

    // const blockedIdxList = await this.blockService.getBlockedList(userIdx);

    // let query = await this.chatMessageRepository
    //   .createQueryBuilder('chatMessage')
    //   .leftJoinAndSelect('chatMessage.user', 'user')
    //   .select(['chatMessage', 'user.idx', 'user.nickname'])
    //   .where('chatMessage.chat.idx = :chatIdx', { chatIdx });

    const messages = await this.chatMessageRepository.find({
      where: { chat: { idx: chatIdx } },
      order: { send_at: 'ASC' },
      relations: ['user'],
    });

    // 내코드
    for (let i = messages.length - 1; i >= 0; i--) {
      const chatMessage = messages[i];
      const isCheck = await this.checkChatMessage(userIdx, chatMessage);
      if (!isCheck) {
        messages.splice(i, 1); // 인덱스 i에서 요소를 제거
      }
    }

    // if (blockList.length > 0) {
    //   query = query.andWhere('user.idx NOT IN (:...blockIdxList)', {
    //     blockIdxList,
    //   });
    // }
    // if (blockedIdxList.length > 0) {
    //   query = query.andWhere('user.idx NOT IN (:...blockedIdxList)', {
    //     blockedIdxList,
    //   });
    // }

    // const chatMessages = await query
    //   .orderBy('chatMessage.send_at', 'ASC')
    //   .getMany();

    return messages;
  }
}
