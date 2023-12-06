import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { lastValueFrom } from 'rxjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { TFASecret } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto } from './dto/login.request.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
  ) {}

  //42Oauth
  async getTokenFrom42(code: string): Promise<any> {
    const clientId = process.env.FORTYTWO_CLIENT_ID;
    const clientSecret = process.env.FORTYTWO_CLIENT_SECRET;
    const redirectUrl = `http://localhost:3000/auth/oauth/42/callback`;

    const tokenUrl = `https://api.intra.42.fr/oauth/token`;

    try {
      const response = await this.httpService.post(tokenUrl, {
        grant_type: 'authorization_code',
        // grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUrl,
      });
      const data = await lastValueFrom(response);

      return data.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserInfoFrom42(token: string): Promise<any> {
    const userInfoUrl = `https://api.intra.42.fr/v2/me`;

    try {
      const response = await axios.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  //Google authentication
  async generateTFASecret(): Promise<TFASecret> {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: 'Transcendence',
    });

    return {
      otpauthUrl: secret.otpauth_url,
      base32: secret.base32,
    };
  }

  async generateQRCode(otpauth_url: string): Promise<string> {
    return QRCode.toDataURL(otpauth_url);
  }

  async validateTFAToken(
    tfa_secret: TFASecret,
    token: string,
  ): Promise<boolean> {
    try {
      return speakeasy.totp.verify({
        secret: tfa_secret.base32,
        encoding: 'base32',
        token: token,
      });
    } catch (error) {
      console.error('Error in validateTFAToken:', error);
      return false;
    }
  }

  // async jwtLogin(data: LoginRequestDto) {
  //   const { id, user_idx } = data;
  //   const payload = { id, user_idx };
  //   return this.jwtService.sign(payload, { secret: process.env.SECRET_KEY });
  // }

  async jwtLogin(data: LoginRequestDto) {
    const { id, user_idx } = data;
    const payload = { id, user_idx };
    return this.jwtService.sign(payload);
  }

  parsingJwtData(token: string) {
    try {
      const data = this.jwtService.verify(token);
      return data;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // async validateToken(token: string): Promise<any> {
  //   try {
  //     const decoded = jwt.verify(token, process.env.SECRET_KEY);
  //     return decoded;
  //   } catch (error) {
  //     throw new Error('Invalid token');
  //   }
  // }
}
