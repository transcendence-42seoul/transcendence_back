import { Module } from '@nestjs/common';
import { AlarmController } from './alarm.controller';
import { AlarmService } from './alarm.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alarm } from './alarm.entity';
import { AlarmRepository } from './alarm.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Alarm])],
  controllers: [AlarmController],
  providers: [AlarmService, AlarmRepository, UserRepository],
  exports: [AlarmService],
})
export class AlarmModule {}
