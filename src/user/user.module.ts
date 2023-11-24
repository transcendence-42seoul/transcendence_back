import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { AvatarRepository } from '../avatar/avatar.repository';
import { RankingRepository } from '../ranking/ranking.repository';
import { RecordRepository } from '../record/record.repository';
import { FriendRequestRepository } from 'src/friend/friend.request.repository';
import { FriendRequestPairRepository } from 'src/friend/friend.request.pair.repository';
import { BlockRepository } from 'src/block/block.repository';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    AvatarRepository,
    RankingRepository,
    RecordRepository,
    FriendRequestRepository,
    FriendRequestPairRepository,
    BlockRepository,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
