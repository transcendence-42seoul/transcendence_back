import { User } from 'src/user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Avatar extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User, (user) => user.avatar, {
    eager: false,
  })
  user: User;

  @Column({ type: 'bytea', nullable: true })
  image_data: Buffer;
}
