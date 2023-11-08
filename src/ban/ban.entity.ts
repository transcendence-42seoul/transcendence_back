import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Ban {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => User, (user) => user.banner, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'banner' })
  banner: User;

  @Column()
  banned: number;
}
