import { Column } from 'typeorm';
import { IGameHistory } from '../record.entity';

export class RecordDto {
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

  @Column('text', { array: true })
  user_game_log: IGameHistory[];

  static convertDto(userData: any): RecordDto {
    const recordDto = new RecordDto();
    recordDto.total_game = userData.total_game;
    recordDto.total_win = userData.total_win;
    recordDto.ladder_game = userData.ladder_game;
    recordDto.ladder_win = userData.ladder_win;
    recordDto.general_game = userData.general_game;
    recordDto.general_win = userData.general_win;
    // recordDto.user_game_log = [];
    return recordDto;
  }
}

export class LadderRecordDto {
  @Column({ nullable: false })
  ladder_game: number;

  @Column({ nullable: false })
  ladder_win: number;

  static convertDto(userData: any): LadderRecordDto {
    const ladderRecordDto = new LadderRecordDto();
    ladderRecordDto.ladder_game = userData.ladder_game;
    ladderRecordDto.ladder_win = userData.ladder_win;
    return ladderRecordDto;
  }
}

export class GeneralRecordDto {
  @Column({ nullable: false })
  general_game: number;

  @Column({ nullable: false })
  general_win: number;

  static convertDto(userData: any): GeneralRecordDto {
    const generalRecordDto = new GeneralRecordDto();
    generalRecordDto.general_game = userData.general_game;
    generalRecordDto.general_win = userData.general_win;
    return generalRecordDto;
  }
}
