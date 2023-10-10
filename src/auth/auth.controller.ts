import { HttpService } from '@nestjs/axios';
import { Controller, Get, Query, Redirect, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly httpService: HttpService,
    private authService: AuthService,
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
        '2a3fc5b2d0d866c9cae697eabc15bd5d616890ff315187b1978e8cbc64247951';
      console.log('accessToken:', accessToken);
      const userInfo = await this.authService.getUserInfoFrom42(accessToken);

      return userInfo.data;
    } catch (error) {
      throw error;
    }
  }
}
