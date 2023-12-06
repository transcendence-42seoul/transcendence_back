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
import { OnlineUserDto } from './dto/online.user.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * createTest, deleteAll
   * 테스트를 위한 메소드
   * 나중에 지울 것
   *
   * @auther : soopark
   */

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

  @Get('/')
  async findAllUsers(): Promise<User[]> {
    return this.userService.findAllUsers();
  }

  // @Get(/myUserData)
  // async getMyUser() {
  //   // return this.userService.
  // }

  @Get('/idx/:idx')
  async findByIdx(@Param('idx') idx: number) {
    return await this.userService.findByIdx(idx);
  }

  @Get('/id/:id')
  async findById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @Get('/check-nickname/:nickname')
  async checkNickname(@Param('nickname') nickname: string): Promise<boolean> {
    return await this.userService.isNicknameUnique(nickname);
  }

  @Patch('/:idx/nickname')
  async updateNickname(
    @Param('idx', ParseIntPipe) idx: number,
    @Body('nickname') nickname: string,
  ): Promise<User> {
    return this.userService.updateUsername(idx, nickname);
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

  @Get('/online')
  async getOnlineUsers(): Promise<OnlineUserDto[]> {
    return this.userService.getOnlineUsers();
  }
}
