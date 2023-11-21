import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Block {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => User, (user) => user.blocker, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'blocker' })
  blocker: User;

  @Column()
  blocked: number;
}
