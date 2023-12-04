import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Record } from './record.entity';

@Injectable()
export class RecordRepository extends Repository<Record> {
  constructor(dataSource: DataSource) {
    super(Record, dataSource.createEntityManager());
  }

  async createRecord() {
    const record = this.create({
      total_game: 0,
      total_win: 0,
      ladder_game: 0,
      ladder_win: 0,
      general_game: 0,
      general_win: 0,
      // user_game_log: [],
    });

    await this.save(record);
    return record;
  }
}
