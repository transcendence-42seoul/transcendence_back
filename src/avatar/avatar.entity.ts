import { User } from 'src/user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Avatar extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_idx', referencedColumnName: 'idx' })
  user_idx: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  image_data: Buffer;
}
