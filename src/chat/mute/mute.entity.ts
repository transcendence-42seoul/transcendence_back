import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from '../chat.entity';
import { User } from 'src/user/user.entity';

@Entity()
export class Mute extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => Chat, (chat) => chat.muted, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.muted, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'muted' })
  muted: User;

  @Column()
  unmute_timestamp: Date;
}
