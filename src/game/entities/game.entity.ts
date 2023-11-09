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

const GameModeType = {
  LADDER_NORMAL: 1,
  LADDER_HARD: 2,
  CHALLENGE_NORMAL: 3,
  CHALLENGE_HARD: 4,
} as const;

export type GameModeType = (typeof GameModeType)[keyof typeof GameModeType];

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
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'current_host' })
  game_host: User;

  @OneToOne(() => User, (user) => user.guest, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'current_guest' })
  game_guest: User;

  @Column()
  gameHost_score: number;

  @Column()
  gameGuest_score: number;
}
