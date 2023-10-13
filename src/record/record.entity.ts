import { User } from '../user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Record extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User, (user) => user.record, {
    eager: false,
  })
  user: User;

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
