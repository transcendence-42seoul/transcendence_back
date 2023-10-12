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

@Module({
  imports: [
    AuthModule,
    UserModule,
    RecordModule,
    AvatarModule,
    RankingModule,
    AlarmModule,
    TypeOrmModule.forRoot(typeORMConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
