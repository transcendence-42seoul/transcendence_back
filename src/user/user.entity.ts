import { Avatar } from 'src/avatar/avatar.entity';
import { Ranking } from 'src/ranking/ranking.entity';
import { Record } from 'src/record/record.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
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
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'avatar' })
  avatar: Avatar;

  @OneToOne(() => Record, (record) => record.user, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'record' })
  record: Record;

  @OneToOne(() => Ranking, (ranking) => ranking.user, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ranking' })
  ranking: Ranking;
}
