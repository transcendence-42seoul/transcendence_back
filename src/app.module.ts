import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RecordModule } from './record/record.module';
import { AvatarModule } from './avatar/avatar.module';
import { RankingModule } from './ranking/ranking.module';
import { AlarmModule } from './alarm/alarm.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { GameModule } from './game/game.module';
import { FriendModule } from './friend/friend.module';
import { BlockModule } from './block/block.module';
import { ChatModule } from './chat/chat.module';
import { KickModule } from './chat/kick/kick.module';
import { BanModule } from './chat/ban/ban.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RecordModule,
    AvatarModule,
    RankingModule,
    AlarmModule,
    TypeOrmModule.forRoot(typeORMConfig),
    GameModule,
    FriendModule,
    BlockModule,
    ChatModule,
    KickModule,
    BanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
