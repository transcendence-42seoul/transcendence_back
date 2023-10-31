import { User } from 'src/user/user.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FriendRequestPair } from './friend.request.pair.entity';

@Entity()
export class FriendRequest {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(
    () => FriendRequestPair,
    (friendRequestPair) => friendRequestPair.friendRequest,
    {
      cascade: true,
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'friendRequestPair' })
  friendRequestPair: FriendRequestPair;

  @ManyToOne(() => User, (user) => user.requester, {
    eager: false,
  })
  requester: User;

  @ManyToOne(() => User, (user) => user.requested, {
    eager: false,
  })
  requested: User;
}
