import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { MuteService } from './mute.service';
import { User } from 'src/user/user.entity';

@Controller('mutes')
export class MuteController {
  constructor(private muteService: MuteService) {}

  @Post('/:chatIdx/:muterIdx/:mutedIdx')
  async mute(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Param('muterIdx', ParseIntPipe) muterIdx: number,
    @Param('mutedIdx', ParseIntPipe) mutedIdx: number,
  ): Promise<void> {
    await this.muteService.muteUser(chatIdx, muterIdx, mutedIdx);
  }

  @Delete('/:chatIdx/:muterIdx/:mutedIdx')
  async deleteMute(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Param('muterIdx', ParseIntPipe) muterIdx: number,
    @Param('mutedIdx', ParseIntPipe) mutedIdx: number,
  ): Promise<void> {
    await this.muteService.deleteMute(chatIdx, muterIdx, mutedIdx);
  }

  @Get('/:chatIdx')
  async getMutes(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
  ): Promise<User[]> {
    return await this.muteService.getMuteList(chatIdx);
  }
}
