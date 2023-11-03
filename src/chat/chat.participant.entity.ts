import { User } from 'src/user/user.entity';
import { Chat } from './chat.entity';
import {
  BaseEntity,
  Entity,
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
  })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.participants, {
    eager: false,
  })
  user: User;

  @Column({ nullable: false })
  role: Role;
}
