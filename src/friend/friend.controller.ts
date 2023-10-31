import { Controller, Param, ParseIntPipe, Get } from '@nestjs/common';
import { FriendService } from './friend.service';

@Controller('friends')
export class FriendController {
  constructor(private friendService: FriendService) {}

  @Get('/:idx/:idx2')
  requestFriend(
    @Param('idx', ParseIntPipe) requesterIdx: number,
    @Param('idx2', ParseIntPipe) requestedIdx: number,
  ) {
    return this.friendService.requestFriend(requesterIdx, requestedIdx);
  }
}
