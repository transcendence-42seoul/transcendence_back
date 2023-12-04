import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { RecordRepository } from './record.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './record.entity';
import { UserRepository } from 'src/user/user.repository';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Record]), UserModule, AuthModule],
  controllers: [RecordController],
  providers: [RecordService, RecordRepository, UserRepository],
  exports: [RecordService],
})
export class RecordModule {}
