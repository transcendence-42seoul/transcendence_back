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
export class Record extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User, {
    eager: false,
  })
  @JoinColumn({ name: 'user_idx', referencedColumnName: 'idx' })
  user_idx: number;

  @Column({ nullable: false })
  total_game: number;

  @Column({ nullable: false })
  total_win: number;

  @Column({ nullable: false })
  ladder_game: number;

  @Column({ nullable: false })
  ladder_win: number;

  @Column({ nullable: false })
  general_game: number;

  @Column({ nullable: false })
  general_win: number;
}
