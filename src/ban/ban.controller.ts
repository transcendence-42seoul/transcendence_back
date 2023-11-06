import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Get,
  Delete,
} from '@nestjs/common';
import { BanService } from './ban.service';
import { User } from 'src/user/user.entity';

@Controller('bans')
export class BanController {
  constructor(private banService: BanService) {}

  @Post('/:bannerIdx/:bannedIdx')
  async banUser(
    @Param('bannerIdx', ParseIntPipe) bannerIdx: number,
    @Param('bannedIdx', ParseIntPipe) bannedIdx: number,
  ): Promise<void> {
    await this.banService.banUser(bannerIdx, bannedIdx);
  }

  @Delete('/:bannerIdx/:bannedIdx')
  async unBanUser(
    @Param('bannerIdx', ParseIntPipe) bannerIdx: number,
    @Param('bannedIdx', ParseIntPipe) bannedIdx: number,
  ): Promise<void> {
    return await this.banService.unBanUser(bannerIdx, bannedIdx);
  }

  @Get('/:idx')
  async getBans(@Param('idx', ParseIntPipe) idx: number): Promise<User[]> {
    return await this.banService.getBanList(idx);
  }
}
