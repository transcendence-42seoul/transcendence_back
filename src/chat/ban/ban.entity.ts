import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from '../chat.entity';
import { User } from 'src/user/user.entity';

@Entity()
export class Ban extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => Chat, (chat) => chat.banned, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.banned, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'banned' })
  banned: User;
}
