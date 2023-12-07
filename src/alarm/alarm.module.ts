import { Module } from '@nestjs/common';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarm } from './alarm.entity';
import { AlarmRepository } from './alarm.repository';
import { UserModule } from 'src/user/user.module';
import { BlockModule } from 'src/block/block.module';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm]), BlockModule, UserModule],
  controllers: [AlarmController],
  providers: [AlarmService, AlarmRepository],
  exports: [AlarmService],
})
export class AlarmModule {}
