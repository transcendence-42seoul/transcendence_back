import { Module } from '@nestjs/common';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import { AvatarRepository } from './avatar.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './avatar.entity';
import { UserRepository } from 'src/user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar])],
  controllers: [AvatarController],
  providers: [AvatarService, AvatarRepository, UserRepository],
  exports: [AvatarRepository],
})
export class AvatarModule {}
