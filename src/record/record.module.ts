import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { RecordRepository } from './record.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Record])],
  controllers: [RecordController],
  providers: [RecordService, RecordRepository],
  //   exports: [Record, RecordRepository],
})
export class RecordModule {}
