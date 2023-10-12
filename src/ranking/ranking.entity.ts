import { User } from '../user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Ranking extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_idx', referencedColumnName: 'idx' })
  user_idx: number;

  @Column({ nullable: true })
  rank: number;

  @Column({ nullable: false })
  score: number;
}
