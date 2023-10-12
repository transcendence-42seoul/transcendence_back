import { Alarm } from 'src/alarm/alarm.entity';
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
  ONLINE = 'online',
  OFFLINE = 'offline',
  PLAYING = 'playing',
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
  mfa_enabled: boolean;

  @OneToOne(() => Avatar, (avatar) => avatar.user_idx, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'avatar_idx' })
  avatar: Avatar;

  @OneToOne(() => Record, (record) => record.user_idx, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'record_idx' })
  record: Record;

  @OneToOne(() => Ranking, (ranking) => ranking.user_idx, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ranking_idx' })
  ranking: Ranking;

  @OneToOne(() => Alarm, (alarm) => alarm.user_idx, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'alarm_idx' })
  alarm: Alarm;
}
