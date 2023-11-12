import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from 'src/user/user.entity';

@Entity()
export class ChatMessage extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false })
  content: string;

  @CreateDateColumn()
  send_at: Date;

  @ManyToOne(() => Chat, (chat) => chat.messages, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  user: User;
}
