import { User } from 'src/user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  // ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum GameMode {
  'LADDER_NORMAL' = 1,
  'LADDER_HARD',
  'CHALLENGEC_NORMAL',
  'CHALLENGEC_HARD',
}

export type GameModeType =
  | GameMode.LADDER_NORMAL
  | GameMode.LADDER_HARD
  | GameMode.CHALLENGEC_NORMAL
  | GameMode.CHALLENGEC_HARD;
@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  game_mode: GameModeType;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  // @ManyToOne(() => User, { cascade: true, eager: true, onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'player1_idx' })
  // player1: User;

  // @ManyToOne(() => User, { cascade: true, eager: true, onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'player2_idx' })
  // player2: User;

  @OneToOne(() => User, (user) => user.game, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player1_idx' })
  player1: User;

  @OneToOne(() => User, (user) => user.game, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'player2_idx' })
  player2: User;

  @Column()
  player1_score: number;

  @Column()
  player2_score: number;
}
