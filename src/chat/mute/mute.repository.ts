import { Injectable } from '@nestjs/common';
import { Mute } from './mute.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MuteRepository extends Repository<Mute> {
  constructor(dataSource: DataSource) {
    super(Mute, dataSource.createEntityManager());
  }

  async createMute(chatIdx: number, mutedIdx: number): Promise<Mute> {
    // 현재 시간에서 30초를 더한 시간 계산x
    // const unmute_timestamp = new Date(new Date().getTime() + 30 * 1000);
    const unmute_timestamp = new Date(new Date().getTime() + 60 * 1000);

    const mute = await this.create({
      chat: { idx: chatIdx },
      muted: { idx: mutedIdx },
      unmute_timestamp,
    });

    await this.save(mute);
    return mute;
  }
}
