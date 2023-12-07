import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { FriendRequestRepository } from './friend.request.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './friend.request.entity';
import { FriendRequestPair } from './friend.request.pair.entity';
import { FriendRequestPairRepository } from './friend.request.pair.repository';
import { UserModule } from 'src/user/user.module';
import { BlockModule } from 'src/block/block.module';
import { AlarmModule } from 'src/alarm/alarm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest, FriendRequestPair]),
    UserModule,
    BlockModule,
    AlarmModule,
  ],
  controllers: [FriendController],
  providers: [
    FriendService,
    FriendRequestRepository,
    FriendRequestPairRepository,
  ],
  exports: [FriendService],
})
export class FriendModule {}
