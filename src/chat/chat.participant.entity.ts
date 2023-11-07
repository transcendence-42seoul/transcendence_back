import { User } from 'src/user/user.entity';
import { Chat } from './chat.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity()
export class ChatParticipant extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => Chat, (chat) => chat.participants, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.participants, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  user: User;

  @Column({ nullable: false })
  role: Role;
}
