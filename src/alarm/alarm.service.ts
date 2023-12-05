import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AlarmRepository } from './alarm.repository';
import { UserRepository } from 'src/user/user.repository';
import { AlarmDto } from './dto/alarm.dto';
import { NotFoundException } from '@nestjs/common';
import { Alarm } from './alarm.entity';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AlarmService {
  constructor(
    @InjectRepository(AlarmRepository)
    private alarmRepository: AlarmRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async createAlarm(userIdx: number, alarmDto: AlarmDto): Promise<Alarm> {
    const receiver = await this.userRepository.findOne({
      where: { idx: userIdx },
    });
    if (!receiver) throw new NotFoundException('유저가 존재하지 않습니다.');

    const sender = await this.userRepository.findOne({
      where: { idx: alarmDto.sender_idx },
    });
    if (!sender) throw new NotFoundException('유저가 존재하지 않습니다.');

    const alarm = await this.alarmRepository.findOne({
      where: {
        receiver: { idx: userIdx },
        sender_idx: alarmDto.sender_idx,
      },
    });
    console.log('alarm', alarm);
    if (alarm) throw new BadRequestException('이미 알람이 존재합니다.');

    return this.alarmRepository.createAlarm(
      receiver,
      alarmDto.sender_idx, // 보내는 사람
      alarmDto.content,
      alarmDto.type,
    );
  }

  async getAlarms(userIdx: number): Promise<Alarm[]> {
    const receiver = await this.userRepository.findOne({
      where: { idx: userIdx },
    });
    if (!receiver) throw new NotFoundException('유저가 존재하지 않습니다.');

    const alarms = await this.alarmRepository.find({
      where: { receiver: { idx: receiver.idx } },
    });
    return alarms;
  }

  async findByIdx(alarmIdx: number): Promise<Alarm> {
    const alarm = await this.alarmRepository.findOne({
      where: { idx: alarmIdx },
    });

    if (!alarm)
      throw new NotFoundException(`Alarm with idx ${alarmIdx} not found`);

    return alarm;
  }

  async deleteAlarm(alarmIdx: number) {
    console.log('deleteAlarm');
    const alarm = await this.alarmRepository.findOne({
      where: { idx: alarmIdx },
    });
    if (!alarm) throw new NotFoundException('알람이 존재하지 않습니다.');

    await this.alarmRepository.delete({ idx: alarmIdx });
  }
}
