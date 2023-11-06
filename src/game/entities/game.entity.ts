import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Set } from './set.entity';

@Entity()
export class Game extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  mode: number;

  @Column()
  start_time: Date;

  @Column()
  player1: number;

  @Column()
  player2: number;

  @Column()
  player1_set_point: number;

  @Column()
  player2_set_point: number;

  @Column()
  set_number: number;

  @OneToOne(() => Set, (set) => set.idx, {
    eager: false,
  })
  @JoinColumn()
  set_id: Set;
}
