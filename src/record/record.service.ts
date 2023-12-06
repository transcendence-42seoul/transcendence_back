import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecordRepository } from './record.repository';
import { UserRepository } from 'src/user/user.repository';
import { IGameHistory, Record } from './record.entity';
import { RecordDto, LadderRecordDto, GeneralRecordDto } from './dto/record.dto';

@Injectable()
export class RecordService {
  constructor(
    @InjectRepository(RecordRepository)
    private recordRepository: RecordRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async findByIdx(idx: number): Promise<Record> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`Can't find user with idx ${idx}`);
    const record = user.record;
    if (!record) throw new NotFoundException(`Can't find User ${idx}'s record`);

    return record;
  }

  async updateRecord(idx: number, recordDto: RecordDto): Promise<Record> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`Can't find user with idx ${idx}`);
    const record = user.record;
    if (!record) throw new NotFoundException(`Can't find User ${idx}'s record`);

    try {
      if (recordDto.total_game !== undefined)
        record.total_game = recordDto.total_game;
      if (recordDto.total_win !== undefined)
        record.total_win = recordDto.total_win;
      if (recordDto.ladder_game !== undefined)
        record.ladder_game = recordDto.ladder_game;
      if (recordDto.ladder_win !== undefined)
        record.ladder_win = recordDto.ladder_win;
      if (recordDto.general_game !== undefined)
        record.general_game = recordDto.general_game;
      if (recordDto.general_win !== undefined)
        record.general_win = recordDto.general_win;

      return await this.recordRepository.save(record);
    } catch (error) {
      throw error;
    }
  }

  async updateLadderRecord(
    idx: number,
    ladderRecordDto: LadderRecordDto,
  ): Promise<Record> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`Can't find user with idx ${idx}`);
    const record = user.record;
    if (!record) throw new NotFoundException(`Can't find User ${idx}'s record`);

    try {
      if (
        !ladderRecordDto ||
        !ladderRecordDto.ladder_game ||
        !ladderRecordDto.ladder_win
      ) {
        throw new BadRequestException('Invalid ladderRecordDto provided');
      }

      if (ladderRecordDto.ladder_game !== undefined) {
        record.ladder_game = ladderRecordDto.ladder_game;
      }
      if (ladderRecordDto.ladder_win !== undefined) {
        record.ladder_win = ladderRecordDto.ladder_win;
      }
      // 이겼으면 total_game, total_win 정보 업데이트

      return await this.recordRepository.save(record);
    } catch (error) {
      throw error;
    }
  }

  async updateGeneralRecord(
    idx: number,
    ladderGeneralDto: GeneralRecordDto,
  ): Promise<Record> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`Can't find user with idx ${idx}`);
    const record = user.record;
    if (!record) throw new NotFoundException(`Can't find User ${idx}'s record`);

    try {
      if (
        !ladderGeneralDto ||
        !ladderGeneralDto.general_game ||
        !ladderGeneralDto.general_win
      ) {
        throw new BadRequestException('Invalid ladderGeneralDto provided');
      }

      if (ladderGeneralDto.general_game !== undefined) {
        record.general_game = ladderGeneralDto.general_game;
      }
      if (ladderGeneralDto.general_win !== undefined) {
        record.general_win = ladderGeneralDto.general_win;
      }
      // 이겼으면 total_game, total_win 정보 업데이트

      return await this.recordRepository.save(record);
    } catch (error) {
      throw error;
    }
  }

  async addGameHistory(userIdx: number, history: IGameHistory) {
    const user = await this.userRepository.findOne({
      where: { idx: userIdx },
    });
    if (!user) {
      throw new Error('User Record not found');
    }
    if (!user.record.user_game_log)
      user.record.user_game_log = new Array<IGameHistory>();
    user.record.user_game_log.push(history);
    await this.recordRepository.save(user.record);
  }
}
