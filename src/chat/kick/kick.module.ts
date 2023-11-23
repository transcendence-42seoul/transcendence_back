import { Module } from '@nestjs/common';
import { KickController } from './kick.controller';
import { KickService } from './kick.service';
import { ChatRepository } from '../chat.repository';
import { ChatParticipantRepository } from '../chat.participant.repository';
import { UserRepository } from 'src/user/user.repository';
import { ChatParticipantService } from '../chat.participant.service';
import { BanRepository } from '../ban/ban.repository';

@Module({
  controllers: [KickController],
  providers: [
    KickService,
    ChatParticipantService,
    BanRepository,
    ChatRepository,
    ChatParticipantRepository,
    UserRepository,
  ],
})
export class KickModule {}
