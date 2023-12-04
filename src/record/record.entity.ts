import { User } from '../user/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameModeType } from 'src/game/entities/game.entity';

export interface IGameHistory {
  win: boolean;
  game_type: GameModeType;
  my_score: number;
  opponent_score: number;
  time: Date;
  opponent_id: string;
  opponent_nickname: string;
}
@Entity()
export class Record extends BaseEntity {
  @PrimaryGeneratedColumn()
  idx: number;

  @OneToOne(() => User, (user) => user.record, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  user: User;

  //total_game, win 제거 at 리팩토링
  @Column({ nullable: false })
  total_game: number;
  @Column({ nullable: false })
  total_win: number;

  @Column({ nullable: false })
  ladder_game: number;

  @Column({ nullable: false })
  ladder_win: number;

  @Column({ nullable: false })
  general_game: number;

  @Column({ nullable: false })
  general_win: number;

  @Column('text', { array: true, nullable: true })
  user_game_log: IGameHistory[];
}

//상대 idx(> 상대 닉네임), 승 or 패, 게임타입, 게임모드, 내 스코어, 상대 스코어, 시간
// idx -> nickname ->
//게임이 끝날 때, 1) host 기준으로 승패여부 확인후 저장 2) 게임타입, 게임모드, 시간 저장 3)내 스코어 상대 idx, 상대 스코어 저장
// 게스트 기준으로 똑같이 저장
