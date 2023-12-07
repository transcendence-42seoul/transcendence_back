import {
  Body,
  Controller,
  Param,
  Get,
  Patch,
  ParseIntPipe,
  Res,
  Req,
} from '@nestjs/common';
import { RecordService } from './record.service';
import { Record } from './record.entity';
import { RecordDto, LadderRecordDto, GeneralRecordDto } from './dto/record.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@Controller('records')
export class RecordController {
  constructor(
    private recordService: RecordService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('/:idx')
  async findByIdx(@Param('idx', ParseIntPipe) idx: number, @Res() res) {
    try {
      const user = await this.userService.findByIdx(idx);
      res.status(200).send(user.record);
    } catch (error) {
      res.status(404).send(error.message);
    }
    return;
  }

  @Get()
  async findGameHistory(@Req() req, @Res() res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new Error('No authorization header');
      }
      const tokenPart = authHeader.split(' ');
      if (tokenPart.length !== 2 || tokenPart[0] !== 'Bearer') {
        throw new Error('Invalid authorization header');
      }
      const accessToken = tokenPart[1];

      const data = await this.authService.parsingJwtData(accessToken);
      const user = await this.userService.findByIdx(data.idx);
      res.status(200).send(user.record);
    } catch (error) {
      res.status(401).send(error.message);
    }
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
