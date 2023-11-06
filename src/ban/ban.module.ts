import { Module } from '@nestjs/common';
import { BanController } from './ban.controller';
import { Ban } from './ban.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanService } from './ban.service';
import { BanRepository } from './ban.repository';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Ban])],
  controllers: [BanController],
  providers: [BanService, BanRepository, UserRepository],
})
export class BanModule {}
