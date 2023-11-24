import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Block } from './block.entity';

@Injectable()
export class BlockRepository extends Repository<Block> {
  constructor(dataSource: DataSource) {
    super(Block, dataSource.createEntityManager());
  }
}
