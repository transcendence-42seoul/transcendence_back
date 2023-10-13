import { Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/deleteAll')
  async deleteAll() {
    await this.userService.deleteAll();
  }
}
