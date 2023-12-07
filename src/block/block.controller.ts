import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Get,
  Delete,
  Res,
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
    @Res() res,
  ): Promise<void> {
    try {
      await this.blockService.unBlockUser(blockerIdx, blockedIdx);
      res.status(200).json({ message: 'success' });
    } catch (err) {
      res.status(400).json({ message: 'fail' });
    }
  }

  @Get('/:idx')
  async getBlocks(@Param('idx', ParseIntPipe) idx: number): Promise<User[]> {
    return await this.blockService.getBlockList(idx);
  }

  // 서로 block 상태인지 확인
  @Get('/check/:userAidx/:userBidx')
  async getBlock(
    @Param('userAidx', ParseIntPipe) userAidx: number,
    @Param('userBidx', ParseIntPipe) userBidx: number,
    @Res() res,
  ): Promise<void> {
    try {
      const requesterBlockList =
        await this.blockService.getBlockedList(userAidx);
      if (requesterBlockList.includes(userBidx)) {
        res.status(200).json({ block: true });
        return;
      }
      res.status(200).json({ block: false });
    } catch (error) {
      res.status(400).json({ block: false });
    }
  }
}
