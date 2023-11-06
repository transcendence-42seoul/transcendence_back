import { FriendRequest } from './friend.request.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { FriendRequestPair } from './friend.request.pair.entity';

@Injectable()
export class FriendRequestRepository extends Repository<FriendRequest> {
  constructor(dataSource: DataSource) {
    super(FriendRequest, dataSource.createEntityManager());
  }

  async createFriendRequest(
    requesterUser: User,
    requestedUser: User,
    friendRequestPair: FriendRequestPair,
  ) {
    const friendRequest = this.create({
      requester: requesterUser,
      requested: requestedUser,
      friendRequestPair: friendRequestPair,
    });
    await this.save(friendRequest);
    return friendRequest;
  }
}
