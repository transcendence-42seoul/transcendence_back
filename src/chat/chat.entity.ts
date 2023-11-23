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
import { Ban } from './ban/ban.entity';
import { Mute } from './mute/mute.entity';

export enum ChatType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  DM = 'DM',
}

@Entity()
export class Chat extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column({ nullable: false })
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

  @OneToMany(() => Ban, (ban) => ban.chat, {
    eager: true,
  })
  banned: Ban[];

  @OneToMany(() => Mute, (mute) => mute.chat, {
    eager: true,
  })
  muted: Mute[];
}
