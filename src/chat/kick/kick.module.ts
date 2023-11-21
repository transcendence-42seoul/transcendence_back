import { Module } from '@nestjs/common';
import { KickController } from './kick.controller';
import { KickService } from './kick.service';
import { ChatRepository } from '../chat.repository';
import { ChatParticipantRepository } from '../chat.participant.repository';

@Module({
  controllers: [KickController],
  providers: [KickService, ChatRepository, ChatParticipantRepository],
})
export class KickModule {}
