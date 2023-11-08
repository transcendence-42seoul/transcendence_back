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

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatParticipant])],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatParticipantService,
    ChatRepository,
    ChatParticipantRepository,
    UserRepository,
  ],
})
export class ChatModule {}
