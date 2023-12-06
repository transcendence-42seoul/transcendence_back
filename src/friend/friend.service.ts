import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequestRepository } from './friend.request.repository';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/user/user.entity';
import { FriendRequestPairRepository } from './friend.request.pair.repository';
import { BlockRepository } from 'src/block/block.repository';
import { AlarmService } from 'src/alarm/alarm.service';
import { FriendRequest } from './friend.request.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(FriendRequestRepository)
    private friendRequestRepository: FriendRequestRepository,
    @InjectRepository(FriendRequestPairRepository)
    private friendRequestPairRepository: FriendRequestPairRepository,
    @InjectRepository(BlockRepository)
    private blockRepository: BlockRepository,
    private alarmService: AlarmService,
  ) {}

  async allowFriend(idx1: number, idx2: number): Promise<void> {
    const user1 = await this.userRepository.findOne({ where: { idx: idx1 } });
    if (!user1)
      throw new NotFoundException(`User with idx "${user1}" not found`);
    const user2 = await this.userRepository.findOne({ where: { idx: idx2 } });
    if (!user2)
      throw new NotFoundException(`User with idx "${user2}" not found`);

    const friendRequest = await this.friendRequestRepository.findOne({
      where: [{ requester: { idx: idx1 }, requested: { idx: idx2 } }],
    });
    if (!friendRequest)
      throw new NotFoundException(
        `Friend request from ${idx1} to ${idx2} not found`,
      );

    const pair = friendRequest.friendRequestPair;
    pair.isAccepted = true;
    this.friendRequestPairRepository.save(pair);
  }

  async requestFriend(
    requesterIdx: number,
    requestedIdx: number,
  ): Promise<FriendRequest> {
    const requesterUser = await this.userRepository.findOne({
      where: { idx: requesterIdx },
    });
    if (!requesterUser)
      throw new NotFoundException(`User with idx ${requesterIdx} not found`);
    const requestedUser = await this.userRepository.findOne({
      where: { idx: requestedIdx },
    });
    if (!requestedUser)
      throw new NotFoundException(`User with idx ${requestedIdx} not found`);

    if (requesterUser.idx === requestedUser.idx)
      throw new BadRequestException('You cannot send friend request to you');

    const blockedUsers = await this.blockRepository.find({
      where: [
        { blocker: { idx: requestedIdx }, blocked: requesterIdx },
        { blocker: { idx: requesterIdx }, blocked: requestedIdx },
      ],
    });
    if (blockedUsers.length === 1)
      throw new BadRequestException('Blocked user');

    let idx1 = requesterIdx;
    let idx2 = requestedIdx;
    if (idx1 > idx2) {
      [idx2, idx1] = [idx1, idx2];
    }

    const friendRequestPair = await this.friendRequestPairRepository.findOne({
      where: [
        {
          user1: idx1,
          user2: idx2,
        },
      ],
    });
    if (friendRequestPair !== null) {
      throw new BadRequestException('Friend request pair already exists');
    }

    const pair = await this.friendRequestPairRepository.createFriendRequestPair(
      idx1,
      idx2,
    );

    return await this.friendRequestRepository.createFriendRequest(
      requesterUser,
      requestedUser,
      pair,
    );
  }

  async getFriendList(idx: number): Promise<User[]> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`Can't find user with idx ${idx}`);

    const pairList = await this.friendRequestPairRepository.find({
      where: [
        { user1: idx, isAccepted: true },
        { user2: idx, isAccepted: true },
      ],
    });

    const friendList: User[] = [];
    for (const pair of pairList) {
      if (pair.user1 === idx) {
        friendList.push(
          await this.userRepository.findOne({ where: { idx: pair.user2 } }),
        );
      } else if (pair.user2 === idx) {
        friendList.push(
          await this.userRepository.findOne({ where: { idx: pair.user1 } }),
        );
      }
    }
    return friendList;
  }

  async allowFriendRequest(
    requester: number,
    requested: number,
  ): Promise<void> {
    const user1 = await this.userRepository.findOne({
      where: { idx: requester },
    });
    if (!user1)
      throw new NotFoundException(`User with idx "${user1}" not found`);
    const user2 = await this.userRepository.findOne({
      where: { idx: requested },
    });
    if (!user2)
      throw new NotFoundException(`User with idx "${user2}" not found`);

    const request = await this.friendRequestRepository.findOne({
      where: [{ requester: { idx: requester }, requested: { idx: requested } }],
    });
    const pair = request.friendRequestPair;

    if (pair.isAccepted) throw new BadRequestException('Already accepted');
    pair.isAccepted = true;
    this.friendRequestPairRepository.save(pair);
  }

  async deleteFriend(idx1: number, idx2: number): Promise<void> {
    const user1 = await this.userRepository.findOne({ where: { idx: idx1 } });
    if (!user1)
      throw new NotFoundException(`User with idx "${user1}" not found`);
    const user2 = await this.userRepository.findOne({ where: { idx: idx2 } });
    if (!user2)
      throw new NotFoundException(`User with idx "${user2}" not found`);

    const request = await this.friendRequestRepository.findOne({
      where: [
        { requester: { idx: idx1 }, requested: { idx: idx2 } },
        { requester: { idx: idx2 }, requested: { idx: idx1 } },
      ],
    });
    if (!request) throw new NotFoundException('Friend request not found');

    const pair = request.friendRequestPair;
    if (!pair) throw new NotFoundException('Friend pair not found');

    this.friendRequestPairRepository.remove(pair);
    this.friendRequestRepository.remove(request);
  }
}
