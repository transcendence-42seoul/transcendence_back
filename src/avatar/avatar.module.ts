import { Module } from '@nestjs/common';
import { AvatarController } from './avatar.controller';
import { AvatarService } from './avatar.service';
import { AvatarRepository } from './avatar.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './avatar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar])],
  controllers: [AvatarController],
  providers: [AvatarService, AvatarRepository],
  exports: [AvatarRepository],
})
export class AvatarModule {}
