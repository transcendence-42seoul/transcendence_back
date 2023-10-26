import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Ranking {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User, (user) => user.ranking, {
    eager: false,
  })
  user: User;

  @Column({ type: 'integer', nullable: true })
  rank: number;

  @Column({ type: 'integer' })
  score: number;
}
