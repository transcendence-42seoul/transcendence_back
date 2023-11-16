import {
  Body,
  Controller,
  Param,
  Get,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { RecordService } from './record.service';
import { Record } from './record.entity';
import { RecordDto, LadderRecordDto, GeneralRecordDto } from './dto/record.dto';

@Controller('records')
export class RecordController {
  constructor(private recordService: RecordService) {}

  @Get('/:idx')
  async findByIdx(@Param('idx', ParseIntPipe) idx: number) {
    return await this.recordService.findByIdx(idx);
  }

  @Patch('/:idx')
  async updateRecord(
    @Param('idx', ParseIntPipe) idx: number,
    @Body() recordDto: RecordDto,
  ): Promise<Record> {
    return this.recordService.updateRecord(idx, recordDto);
  }

  @Patch('/:idx/ladder')
  async updateLadderRecord(
    @Param('idx', ParseIntPipe) idx: number,
    @Body() ladderRecordDto: LadderRecordDto,
  ): Promise<Record> {
    return this.recordService.updateLadderRecord(idx, ladderRecordDto);
  }

  @Patch('/:idx/general')
  async updateGeneralRecord(
    @Param('idx', ParseIntPipe) idx: number,
    @Body() generalRecordDto: GeneralRecordDto,
  ): Promise<Record> {
    return this.recordService.updateGeneralRecord(idx, generalRecordDto);
  }
}
