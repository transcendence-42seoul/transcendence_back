import { Module } from '@nestjs/common';
import { BanService } from './ban.service';
import { BanController } from './ban.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ban } from './ban.entity';
import { BanRepository } from './ban.repository';
import { ChatRepository } from '../chat.repository';
import { ChatParticipantRepository } from '../chat.participant.repository';
import { UserRepository } from 'src/user/user.repository';
import { ChatParticipantService } from '../chat.participant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ban])],
  controllers: [BanController],
  providers: [
    BanService,
    ChatParticipantService,
    BanRepository,
    ChatRepository,
    ChatParticipantRepository,
    UserRepository,
  ],
})
export class BanModule {}
