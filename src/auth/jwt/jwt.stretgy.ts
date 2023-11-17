import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from './jwt.payload';
// import { CatsRepository } from 'src/cats/cats.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken,
      secretOrKey: process.env.SECRET_KEY, // jwt가 제대로 된 놈인지 확인할 수 있는 키이다. env에서 관리해야한다.
      ignoredExpiration: false, // 만료 기간을 고려한다.
    });
  }

  //   async validate(payload: Payload) {
  // const cat = await this.catRepository.findCatByIdWithoutPassword(
  //   payload.sub,
  // );
  // if (!cat) {
  //   throw new UnauthorizedException('토큰 값이 잘못되었습니다.');
  // }
  // return cat; // request.user에 cat이 들어간다.
  //   }
}
