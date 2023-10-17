import { Column } from 'typeorm';
import { Record } from '../record.entity';

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

  static convertDto(record: Record): RecordDto {
    const recordDto = new RecordDto();
    recordDto.total_game = record.total_game;
    recordDto.total_win = record.total_win;
    recordDto.ladder_game = record.ladder_game;
    recordDto.ladder_win = record.ladder_win;
    recordDto.general_game = record.general_game;
    recordDto.general_win = record.general_win;
    return recordDto;
  }
}
