import { User } from 'src/user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export const GameMode = {
  LADDER_NORMAL: 1,
  LADDER_HARD: 2,
  CHALLENGE_NORMAL: 3,
  CHALLENGE_HARD: 4,
} as const;

export type GameModeType = (typeof GameMode)[keyof typeof GameMode];

@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ type: 'uuid', default: uuidv4() }) // 이 부분이 추가됨
  room_id: string;

  @Column({ nullable: false })
  game_status: boolean;

  @Column({ nullable: false })
  game_mode: GameModeType;

  @Column({ nullable: false })
  start_time: Date;

  @Column({ nullable: false })
  end_time: Date;

  @OneToOne(() => User, (user) => user.host, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_host' })
  game_host: User;

  @OneToOne(() => User, (user) => user.guest, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game_guest' })
  game_guest: User;

  @Column({ nullable: false })
  gameHost_score: number;

  @Column({ nullable: false })
  gameGuest_score: number;
}
