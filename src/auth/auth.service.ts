import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { lastValueFrom } from 'rxjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { TFASecret } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  //42Oauth
  async getTokenFrom42(code: string): Promise<any> {
    const clientId = `u-s4t2ud-decaba972e71347060f602c587ad21a8158074daa139ecd5dad4dc9faec4f603`;
    const clientSecret = `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`;
    const redirectUrl = `http://localhost:3000/auth/callback`;

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
    const secret = speakeasy.generate2FASecret({
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

  async validateTFAToken(tfa_secret: string, token: string) {
    return speakeasy.totp.verfiy({
      secret: tfa_secret,
      encoding: 'base32',
      token: token,
    });
  }
}
