import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Alarm, AlarmType } from './alarm.entity';
import { User } from '../user/user.entity';

@Injectable()
export class AlarmRepository extends Repository<Alarm> {
  constructor(dataSource: DataSource) {
    super(Alarm, dataSource.createEntityManager());
  }

  async createAlarm(
    receiver: User,
    sender_idx: number,
    content: string,
    type: AlarmType,
  ): Promise<Alarm> {
    const alarm = this.create({
      receiver,
      sender_idx,
      content,
      type,
    });
    await this.save(alarm);
    return alarm;
  }
}
