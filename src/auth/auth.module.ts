import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { RankingRepository } from 'src/ranking/ranking.repository';
import { RecordRepository } from 'src/record/record.repository';
import { AvatarRepository } from 'src/avatar/avatar.repository';
import { FriendRequestRepository } from 'src/friend/friend.request.repository';
import { FriendRequestPairRepository } from 'src/friend/friend.request.pair.repository';
import { BlockRepository } from 'src/block/block.repository';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    UserRepository,
    RankingRepository,
    RecordRepository,
    AvatarRepository,
    FriendRequestRepository,
    FriendRequestPairRepository,
    BlockRepository,
  ],
})
export class AuthModule {}
