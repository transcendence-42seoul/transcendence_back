import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { UserStatusValidationPipe } from './pipes/user-status.validation.pipe';
import { TFASecret, User, UserStatus } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * deleteAll
   * 테스트를 위한 메소드
   * 나중에 지울 것
   *
   * @auther : soopark
   */
  @Delete('/deleteAll')
  async deleteAll() {
    await this.userService.deleteAll();
  }

  @Get('/')
  async findAllUsers(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  @Get('/:idx')
  async findByIdx(@Param('idx') idx: number) {
    return await this.userService.findByIdx(idx);
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Patch('/:idx/profile')
  async updateProfile(
    @Param('idx', ParseIntPipe) idx: number,
    @Body() userDto: UserDto,
  ): Promise<User> {
    return this.userService.updateProfile(idx, userDto);
  }

  @Patch('/:idx/status')
  async updateStatus(
    @Param('idx', ParseIntPipe) idx: number,
    @Body('status', UserStatusValidationPipe) status: UserStatus,
  ): Promise<User> {
    return this.userService.updateStatus(idx, status);
  }

  @Patch('/:idx/tfa')
  async updateTFA(
    @Param('idx', ParseIntPipe) idx: number,
    @Body('tfa_enabled') tfa_enabled: boolean,
    @Body('tfa_secret') tfa_secret: TFASecret,
  ): Promise<User> {
    return this.userService.updateTFA(idx, tfa_enabled, tfa_secret);
  }

  @Delete('/:idx')
  async deleteByIdx(@Param('idx', ParseIntPipe) idx: number) {
    await this.userService.deleteByIdx(idx);
  }
}
