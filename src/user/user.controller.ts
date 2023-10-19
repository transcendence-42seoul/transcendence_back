import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { UserStatusValidationPipe } from './pipes/user-status.validation.pipe';
import { TFASecret, User, UserStatus } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/createTest')
  async createTest() {
    await this.userService.signup({
      id: 'test',
      nickname: 'test',
      email: 'test',
    });
  }

  @Delete('/deleteAll')
  async deleteAll() {
    await this.userService.deleteAll();
  }

  @Delete('/delete/:idx')
  async deleteByIdx(@Param('idx', ParseIntPipe) idx: number) {
    await this.userService.deleteByIdx(idx);
  }

  @Get('/find/:id')
  async findId(@Param('id') id: string) {
    return await this.userService.findId(id);
  }

  @Patch('/update/:idx/profile')
  async updateProfile(
    @Param('idx', ParseIntPipe) idx: number,
    @Body() userDto: UserDto,
  ): Promise<User> {
    return this.userService.updateProfile(idx, userDto);
  }

  @Patch('/update/:idx/status')
  async updateStatus(
    @Param('idx', ParseIntPipe) idx: number,
    @Body('status', UserStatusValidationPipe) status: UserStatus,
  ): Promise<User> {
    return this.userService.updateStatus(idx, status);
  }

  @Patch('/update/:idx/tfa')
  async updateTFA(
    @Param('idx', ParseIntPipe) idx: number,
    @Body('tfa_enabled') tfa_enabled: boolean,
    @Body('tfa_secret') tfa_secret: TFASecret,
  ): Promise<User> {
    return this.userService.updateTFA(idx, tfa_enabled, tfa_secret);
  }
}
