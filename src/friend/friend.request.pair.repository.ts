import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FriendRequestPair } from './friend.request.pair.entity';

@Injectable()
export class FriendRequestPairRepository extends Repository<FriendRequestPair> {
  constructor(dataSource: DataSource) {
    super(FriendRequestPair, dataSource.createEntityManager());
  }

  async createFriendRequestPair(idx1: number, idx2: number) {
    const friendRequestPair = this.create({
      user1: idx1,
      user2: idx2,
      isAccepted: false,
    });
    await this.save(friendRequestPair);
    return friendRequestPair;
  }
}
