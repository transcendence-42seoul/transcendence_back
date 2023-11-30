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
import { ChatGateway } from './chat.gateway';
import { BanRepository } from './ban/ban.repository';
import { MuteRepository } from './mute/mute.repository';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';
import { RankingRepository } from 'src/ranking/ranking.repository';
import { RecordRepository } from 'src/record/record.repository';
import { AvatarRepository } from 'src/avatar/avatar.repository';
import { FriendRequestRepository } from 'src/friend/friend.request.repository';
import { FriendRequestPairRepository } from 'src/friend/friend.request.pair.repository';
import { BlockRepository } from 'src/block/block.repository';
import { KickService } from './kick/kick.service';

@Module({
  imports: [
    AuthModule,
    HttpModule,
    TypeOrmModule.forFeature([Chat, ChatParticipant, ChatMessage]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatParticipantService,
    ChatRepository,
    ChatParticipantRepository,
    ChatMessageService,
    ChatMessageRepository,
    BanRepository,
    RankingRepository,
    RecordRepository,
    AvatarRepository,
    FriendRequestRepository,
    FriendRequestPairRepository,
    BlockRepository,
    MuteRepository,
    UserService,
    UserRepository,
    ChatGateway,
    KickService,
  ],
  exports: [ChatService, ChatParticipantService],
})
export class ChatModule {}
