import {
  Controller,
  Param,
  ParseIntPipe,
  Get,
  Patch,
  Delete,
  Post,
  Res,
} from '@nestjs/common';
import { FriendService } from './friend.service';

@Controller('friends')
export class FriendController {
  constructor(private friendService: FriendService) {}

  @Post('/:requesterIdx/:requestedIdx')
  async requestFriend(
    @Param('requesterIdx', ParseIntPipe) requesterIdx: number,
    @Param('requestedIdx', ParseIntPipe) requestedIdx: number,
    @Res() res,
  ) {
    try {
      await this.friendService.requestFriend(requesterIdx, requestedIdx);
      res.status(200).json({ message: 'success' });
    } catch (err) {
      res.status(400).json({ message: 'fail' });
    }
  }

  @Get('/:idx')
  async getFriends(@Param('idx', ParseIntPipe) idx: number) {
    return await this.friendService.getFriendList(idx);
  }

  //   @Patch('/:idx')
  //   async allowFriend(
  //     @GetUser() requested: User,
  //     @Param('idx', ParseIntPipe) requesterIdx: number,
  //   ) {
  //     return await this.friendService.allowFriend(requesterIdx, requested.idx);
  //   }

  // requested : 자기 자신 (친구 요청을 받은 사람)
  @Patch('/:requestedIdx/:requesterIdx')
  async allowFriend(
    @Param('requestedIdx', ParseIntPipe) requestedIdx: number,
    @Param('requesterIdx', ParseIntPipe) requesterIdx: number,
  ) {
    return await this.friendService.allowFriend(requesterIdx, requestedIdx);
  }

  // @Delete('/:idx')
  // async deleteFriend(
  //   @GetUser() requester: User, // self
  //   @Param('idx', ParseIntPipe) requestedIdx: number, // deleted
  // ) {
  //   return await this.friendService.deleteFriend(requester.idx, requestedIdx);
  // }

  @Delete('/:idx1/:idx2')
  async deleteFriend(
    @Param('idx1', ParseIntPipe) requesterIdx: number,
    @Param('idx2', ParseIntPipe) requestedIdx: number,
  ) {
    return await this.friendService.deleteFriend(requesterIdx, requestedIdx);
  }
}
