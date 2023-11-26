import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { RankingRepository } from 'src/ranking/ranking.repository';
import { RecordRepository } from 'src/record/record.repository';
import { AvatarRepository } from 'src/avatar/avatar.repository';
import { FriendRequestRepository } from 'src/friend/friend.request.repository';
import { FriendRequestPairRepository } from 'src/friend/friend.request.pair.repository';
import { BanRepository } from 'src/chat/ban/ban.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.stretgy';
import { ConfigModule } from '@nestjs/config';
import { BlockRepository } from 'src/block/block.repository';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.register({
      // secret: `${process.env.SECRET_KEY}`, // JwtStrategy에 있는 키와 통일 시켜줘야한다.
      secret: process.env.SECRET_KEY, // JwtStrategy에 있는 키와 통일 시켜줘야한다.
      signOptions: { expiresIn: '1y' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    UserRepository,
    RankingRepository,
    RecordRepository,
    AvatarRepository,
    FriendRequestRepository,
    FriendRequestPairRepository,
    BanRepository,
    JwtStrategy,
    BlockRepository,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
