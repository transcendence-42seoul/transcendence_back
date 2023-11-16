import {
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Ranking {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User, (user) => user.ranking, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  user: User;

  @Column({ type: 'integer' })
  score: number;
}
