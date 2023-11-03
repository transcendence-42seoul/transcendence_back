import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
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
  type: ChatType;

  @Column({ nullable: true, comment: 'must be encrypted' })
  password: string;

  @CreateDateColumn()
  create_time: Date;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chat, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat' })
  messages: ChatMessage[];

  @OneToMany(() => ChatParticipant, (chatParticipant) => chatParticipant.chat, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'participants' })
  participants: ChatParticipant[];
}
