import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Ban {
  @PrimaryGeneratedColumn()
  idx: number;

  @ManyToOne(() => User, (user) => user.banner, {
    eager: false,
  })
  banner: User;

  @Column()
  banned: number;
}
