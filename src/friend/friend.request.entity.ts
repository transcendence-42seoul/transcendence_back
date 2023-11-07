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
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  friendRequestPair: FriendRequestPair;

  @ManyToOne(() => User, (user) => user.requester, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'requester' })
  requester: User;

  @ManyToOne(() => User, (user) => user.requested, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'requested' })
  requested: User;
}
