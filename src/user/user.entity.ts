import { Avatar } from 'src/avatar/avatar.entity';
import { Ban } from 'src/ban/ban.entity';
import { FriendRequest } from 'src/friend/friend.request.entity';
import { Ranking } from 'src/ranking/ranking.entity';
import { Record } from 'src/record/record.entity';
import { ChatMessage } from 'src/chat/chat.message.entity';
import { ChatParticipant } from 'src/chat/chat.participant.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  PLAYING = 'PLAYING',
}

export interface TFASecret {
  otpauthUrl: string;
  base32: string;
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ unique: true, nullable: false })
  id: string;

  @Column({ nullable: false })
  nickname: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  status: UserStatus;

  @Column({ nullable: false })
  tfa_enabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  tfa_secret: TFASecret;

  @OneToOne(() => Avatar, (avatar) => avatar.user, {
    eager: true,
  })
  avatar: Avatar;

  @OneToOne(() => Record, (record) => record.user, {
    eager: true,
  })
  record: Record;

  @OneToOne(() => Ranking, (ranking) => ranking.user, {
    eager: true,
  })
  ranking: Ranking;

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.requester, {
    eager: true,
  })
  requester: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.requested, {
    eager: true,
  })
  requested: FriendRequest[];

  @OneToMany(() => Ban, (ban) => ban.banner, {
    eager: true,
  })
  banner: Ban[];

  // @OneToMany(() => Game, (game) => game.idx, {
  //   cascade: true,
  //   eager: true,
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'game' })
  // record_games: Game[];

  // @OneToOne(() => Ranking, (ranking) => ranking.user, {
  //   cascade: true,
  //   eager: true,
  //   onDelete: 'CASCADE',
  // })
  // @Column({ nullable: true })
  // current_game: Game;

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.user, {
    eager: true,
  })
  participants: ChatParticipant[];

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.user, {
    eager: true,
  })
  messages: ChatMessage[];
}
