import { FriendRequest } from './friend.request.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class FriendRequestRepository extends Repository<FriendRequest> {
  constructor(dataSource: DataSource) {
    super(FriendRequest, dataSource.createEntityManager());
  }

  async createFriendRequest(requesterUser: User, requestedUser: User) {
    const friendRequest = this.create({
      requester: requesterUser,
      requested: requestedUser,
    });
    await this.save(friendRequest);
    return friendRequest;
  }
}
