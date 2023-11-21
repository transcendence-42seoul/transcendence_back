import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChatMessage } from './chat.message.entity';
import { ChatParticipant } from './chat.participant.entity';

export enum ChatType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  DM = 'DM',
}

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: false })
  limit: number;

  @Column({ nullable: false })
  currentParticipant: number;

  @Column({ nullable: false })
  type: ChatType;

  @Column({ nullable: true, comment: 'must be encrypted' })
  password: string;

  @CreateDateColumn()
  create_time: Date;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chat, {
    eager: true,
  })
  messages: ChatMessage[];

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.chat, {
    eager: true,
  })
  participants: ChatParticipant[];
}
