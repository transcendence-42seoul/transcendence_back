import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendRequestRepository } from './friend.request.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './friend.request.entity';
import { FriendRequestPair } from './friend.request.pair.entity';
import { UserRepository } from 'src/user/user.repository';
import { FriendRequestPairRepository } from './friend.request.pair.repository';
import { BlockRepository } from 'src/block/block.repository';
import { AlarmService } from 'src/alarm/alarm.service';
import { AlarmRepository } from 'src/alarm/alarm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest, FriendRequestPair])],
  controllers: [FriendController],
  providers: [
    FriendService,
    FriendRequestRepository,
    FriendRequestPairRepository,
    UserRepository,
    BlockRepository,
    AlarmService,
    AlarmRepository,
  ],
  exports: [FriendService],
})
export class FriendModule {}
