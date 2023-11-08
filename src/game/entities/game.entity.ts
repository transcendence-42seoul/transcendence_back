// import { User } from 'src/user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  // JoinColumn,
  // ManyToOne,
  // OneToOne,
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
  game_mode: GameModeType;

  @Column({ nullable: false })
  start_time: Date;

  @Column({ nullable: false })
  end_time: Date;

  @Column()
  player1: number;

  @Column()
  player2: number;

  @Column()
  player1_score: number;

  @Column()
  player2_score: number;
}