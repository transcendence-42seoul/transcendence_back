import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { FriendRequest } from './friend.request.entity';

@Entity()
export class FriendRequestPair {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false })
  user1: number;

  @Column({ nullable: false })
  user2: number;

  @Column({ default: false })
  isAccepted: boolean;

  @OneToOne(
    () => FriendRequest,
    (friendRequest) => friendRequest.friendRequestPair,
    {
      eager: false,
    },
  )
  friendRequest: FriendRequest;
}
