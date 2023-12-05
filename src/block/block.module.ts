import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { BlockController } from './block.controller';
import { BlockRepository } from './block.repository';
import { BlockService } from './block.service';
import { Block } from './block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Block])],
  controllers: [BlockController],
  providers: [BlockService, BlockRepository, UserRepository],
  exports: [BlockService],
})
export class BlockModule {}
