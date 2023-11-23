import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Get,
  Delete,
} from '@nestjs/common';
import { BlockService } from './block.service';
import { User } from 'src/user/user.entity';

@Controller('blocks')
export class BlockController {
  constructor(private blockService: BlockService) {}

  @Post('/:blockerIdx/:blockedIdx')
  async blockUser(
    @Param('blockerIdx', ParseIntPipe) blockerIdx: number,
    @Param('blockedIdx', ParseIntPipe) blockedIdx: number,
  ): Promise<void> {
    await this.blockService.blockUser(blockerIdx, blockedIdx);
  }

  @Delete('/:blockerIdx/:blockedIdx')
  async unBlockUser(
    @Param('blockerIdx', ParseIntPipe) blockerIdx: number,
    @Param('blockedIdx', ParseIntPipe) blockedIdx: number,
  ): Promise<void> {
    await this.blockService.unBlockUser(blockerIdx, blockedIdx);
  }

  @Get('/:idx')
  async getBlocks(@Param('idx', ParseIntPipe) idx: number): Promise<User[]> {
    return await this.blockService.getBlockList(idx);
  }
}
