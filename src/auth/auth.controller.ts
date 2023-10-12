import { HttpService } from '@nestjs/axios';
import { Controller, Get, Query, Redirect, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly httpService: HttpService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Get('authorize')
  @Redirect()
  async loginWith42() {
    const clientId = `u-s4t2ud-decaba972e71347060f602c587ad21a8158074daa139ecd5dad4dc9faec4f603`;
    const redirectUrl = 'http://localhost:3000/auth/callback';
    const url = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code`;
    return { url };
  }

  @Get('callback')
  async loginWith42Callback(@Query('code') code: string, @Res() res: Response) {
    try {
      const token = await this.authService.getTokenFrom42(code);
      console.log(token);

      res.json(token);
    } catch (error) {
      console.log('error', error);
    }
  }

  @Get('profile')
  async getUserInfo(@Req() req): Promise<any> {
    try {
      // const accessToken = req.headers.authorization.split(' ')[1];
      const accessToken =
        '71732c3fb06af3860da0199fb60f139043899e2c3a6ae01710c0299722988e7b';
      const userInfo = await this.authService.getUserInfoFrom42(accessToken);

      const userData = userInfo.data;
      const user = await this.userService.findOrCreateUser(userData);

      return user;
    } catch (error) {
      throw error;
    }
  }
}
