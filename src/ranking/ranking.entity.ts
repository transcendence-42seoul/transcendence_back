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

  @OneToOne(() => User, (user) => user.ranking, {
    eager: false,
  })
  user: User;

  @Column({ nullable: true })
  rank: number;

  @Column({ nullable: false })
  score: number;
}
