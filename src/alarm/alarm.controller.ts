import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Body,
  Get,
  Delete,
} from '@nestjs/common';
import { AlarmService } from './alarm.service';
import { AlarmDto } from './dto/alarm.dto';
import { Alarm } from './alarm.entity';

@Controller('alarms')
export class AlarmController {
  constructor(private alarmService: AlarmService) {}

  @Post('/:userIdx')
  async createAlarm(
    @Param('userIdx', ParseIntPipe) userIdx: number,
    @Body() alarmDto: AlarmDto,
  ): Promise<Alarm> {
    return this.alarmService.createAlarm(userIdx, alarmDto);
  }

  @Get('/:userIdx')
  async getAlarms(
    @Param('userIdx', ParseIntPipe) userIdx: number,
  ): Promise<Alarm[]> {
    return this.alarmService.getAlarms(userIdx);
  }

  @Get('/idx/:alarmIdx')
  async findByIdx(@Param('alarmIdx') alarmIdx: number) {
    return await this.alarmService.findByIdx(alarmIdx);
  }

  @Delete('/:alarmIdx')
  async deleteAlarm(@Param('alarmIdx', ParseIntPipe) alarmIdx: number) {
    return this.alarmService.deleteAlarm(alarmIdx);
  }
}
