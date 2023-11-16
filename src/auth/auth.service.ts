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
}
