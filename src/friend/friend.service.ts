import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendRequestRepository } from './friend.request.repository';
import { UserRepository } from 'src/user/user.repository';
import { User } from 'src/user/user.entity';
import { FriendRequestPairRepository } from './friend.request.pair.repository';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(FriendRequestRepository)
    private friendRequestRepository: FriendRequestRepository,
    @InjectRepository(FriendRequestPairRepository)
    private friendRequestPairRepository: FriendRequestPairRepository,
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

  async requestFriend(requesterIdx: number, requestedIdx: number) {
    const user1 = await this.userRepository.findOne({
      where: { idx: requesterIdx },
    });
    if (!user1)
      throw new NotFoundException(`User with idx "${user1}" not found`);
    const user2 = await this.userRepository.findOne({
      where: { idx: requestedIdx },
    });
    if (!user2)
      throw new NotFoundException(`User with idx "${user2}" not found`);

    const friendRequest = await this.friendRequestRepository.findOne({
      where: {
        requester: { idx: requesterIdx },
        requested: { idx: requestedIdx },
      },
      relations: ['requester', 'requested'],
    });
    if (friendRequest) {
      return { message: 'Friend request already sent' };
    }

    const requesterUser = await this.userRepository.findOne({
      where: { idx: requesterIdx },
    });
    const requestedUser = await this.userRepository.findOne({
      where: { idx: requestedIdx },
    });
    if (!requesterUser)
      throw new NotFoundException(`User with idx ${requesterIdx} not found`);
    if (!requestedUser)
      throw new NotFoundException(`User with idx ${requestedIdx} not found`);

    await this.friendRequestRepository.createFriendRequest(
      requesterUser,
      requestedUser,
    );

    // pair logic

    let idx1 = requesterIdx;
    let idx2 = requestedIdx;
    if (idx1 < idx2) {
      [idx2, idx1] = [idx1, idx2];
    }

    this.friendRequestPairRepository.createFriendRequestPair(idx1, idx2);

    return { message: 'Friend request sent' };
  }

  async getFriendList(idx: number): Promise<User[]> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`Can't find user with idx ${idx}`);

    const pairList = await this.friendRequestPairRepository.find({
      where: [{ user1: idx }, { user2: idx }, { isAccepted: true }],
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
}