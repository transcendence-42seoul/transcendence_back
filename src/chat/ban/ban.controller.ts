import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { BanService } from './ban.service';
import { User } from 'src/user/user.entity';

@Controller('bans')
export class BanController {
  constructor(private banService: BanService) {}

  @Post('/:chatIdx/:bannerIdx/:bannedIdx')
  async ban(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Param('bannerIdx', ParseIntPipe) bannerIdx: number,
    @Param('bannedIdx', ParseIntPipe) bannedIdx: number,
  ): Promise<void> {
    await this.banService.banUser(chatIdx, bannerIdx, bannedIdx);
  }

  @Delete('/:chatIdx/:bannerIdx/:bannedIdx')
  async deleteBan(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Param('bannerIdx', ParseIntPipe) bannerIdx: number,
    @Param('bannedIdx', ParseIntPipe) bannedIdx: number,
  ): Promise<void> {
    await this.banService.deleteBan(chatIdx, bannerIdx, bannedIdx);
  }

  @Get('/:chatIdx')
  async getBans(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
  ): Promise<User[]> {
    return await this.banService.getBanList(chatIdx);
  }
}
