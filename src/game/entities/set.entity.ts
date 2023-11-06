import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Set extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @Column()
  player1_point: number;

  @Column()
  player2_point: number;
}
