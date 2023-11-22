import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatParticipantService } from './chat.participant.service';
import { ChatRepository } from './chat.repository';
import { UserRepository } from 'src/user/user.repository';
import { Chat } from './chat.entity';
import { ChatParticipant } from './chat.participant.entity';
import { ChatParticipantRepository } from './chat.participant.repository';
import { ChatMessageService } from './chat.message.service';
import { ChatMessageRepository } from './chat.message.repository';
import { ChatMessage } from './chat.message.entity';
import { ChatsGateway } from './chats.gateway';
import { BanRepository } from './ban/ban.repository';
import { MuteRepository } from './mute/mute.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatParticipant, ChatMessage])],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatParticipantService,
    ChatRepository,
    ChatParticipantRepository,
    ChatMessageService,
    ChatMessageRepository,
    BanRepository,
    MuteRepository,
    UserRepository,
    ChatsGateway,
  ],
})
export class ChatModule {}
