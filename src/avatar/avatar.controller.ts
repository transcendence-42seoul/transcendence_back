import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { Avatar } from './avatar.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('avatars')
export class AvatarController {
  constructor(private avatarService: AvatarService) {}

  @Patch('/:idx')
  @UseInterceptors(FileInterceptor('image'))
  async updateByIdx(
    @Param('idx', ParseIntPipe) idx: number,
    @UploadedFile() file,
  ): Promise<Avatar> {
    return this.avatarService.updateAvatar(idx, file);
  }

  @Delete('/:idx')
  async deleteByIdx(@Param('idx', ParseIntPipe) idx: number) {
    await this.avatarService.deleteByIdx(idx);
  }
}
