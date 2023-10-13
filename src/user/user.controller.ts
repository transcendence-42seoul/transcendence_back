import { Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';

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

  @Post('/deleteAll')
  async deleteAll() {
    await this.userService.deleteAll();
  }

  @Get('/find/:id')
  async findId(@Param('id') id: string) {
    return await this.userService.findId(id);
  }
}
