import { User } from 'src/user/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AlarmType {
  FREIND_REQUEST = 'friend_request',
  REQUEST_RESULT = 'request_result',
  DM = 'dm',
  GENERAL = 'general',
}

@Entity()
export class Alarm extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => User, (user) => user.alarm, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiver' })
  receiver: User; // 받는 사람

  @Column({ nullable: false })
  sender_idx: number; // 보내는 사람

  @Column({ nullable: true })
  room_idx: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn()
  timeStamp: Date;

  @Column({ nullable: false })
  type: AlarmType;
}
