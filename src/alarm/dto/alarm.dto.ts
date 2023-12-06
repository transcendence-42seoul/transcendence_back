import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AlarmType } from '../alarm.entity';
import { Alarm } from '../alarm.entity';

export class AlarmDto {
  @IsNotEmpty()
  @IsInt()
  idx: number;

  @IsNotEmpty()
  @IsInt()
  sender_idx: number;

  @IsOptional()
  @IsInt()
  room_idx: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  type: AlarmType;

  static convertDto(
    sender_idx: number,
    content: string,
    type: AlarmType,
  ): AlarmDto {
    const alarmDto = new AlarmDto();
    alarmDto.sender_idx = sender_idx;
    alarmDto.content = content;
    alarmDto.type = type;

    return alarmDto;
  }

  static fromEntity(alarm: Alarm): AlarmDto {
    const alarmDto = new AlarmDto();
    alarmDto.idx = alarm.idx;
    alarmDto.sender_idx = alarm.sender_idx;
    alarmDto.content = alarm.content;
    alarmDto.type = alarm.type;

    return alarmDto;
  }
}
