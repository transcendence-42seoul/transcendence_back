import { Controller, Post } from '@nestjs/common';
import { KickService } from './kick.service';
import { Param, ParseIntPipe } from '@nestjs/common';

@Controller('kicks')
export class KickController {
  constructor(private kickService: KickService) {}

  @Post('/:chatIdx/:kickerIdx/:kickedIdx')
  async kick(
    @Param('chatIdx', ParseIntPipe) chatIdx: number,
    @Param('kickerIdx', ParseIntPipe) kickerIdx: number,
    @Param('kickedIdx', ParseIntPipe) kickedIdx: number,
  ) {
    await this.kickService.kickParticipant(chatIdx, kickerIdx, kickedIdx);
  }
}
