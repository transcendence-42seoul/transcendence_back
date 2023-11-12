import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Ban } from './ban.entity';

@Injectable()
export class BanRepository extends Repository<Ban> {
  constructor(dataSource: DataSource) {
    super(Ban, dataSource.createEntityManager());
  }
}
