import { Module } from '@nestjs/common';
import { MuteService } from './mute.service';
import { MuteController } from './mute.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mute } from './mute.entity';
import { MuteRepository } from './mute.repository';
import { ChatRepository } from '../chat.repository';
import { ChatParticipantRepository } from '../chat.participant.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Mute])],
  controllers: [MuteController],
  providers: [
    MuteService,
    MuteRepository,
    ChatRepository,
    ChatParticipantRepository,
    UserRepository,
  ],
})
export class MuteModule {}
