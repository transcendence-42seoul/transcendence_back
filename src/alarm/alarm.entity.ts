import { User } from 'src/user/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AlarmType {
  FREIND_REQUEST = 'friend_request',
  REQUEST_RESULT = 'request_result',
  GAME_REQUEST = 'game_request',
}

@Entity()
export class Alarm extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_idx', referencedColumnName: 'idx' })
  user_idx: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn()
  timeStamp: Date;

  @Column({ nullable: true })
  type: AlarmType;

  @Column({ nullable: true })
  isChecked: boolean;
}
