import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { BlockController } from './block.controller';
import { BlockRepository } from './block.repository';
import { BlockService } from './block.service';
import { Block } from './block.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Block]), UserModule],
  controllers: [BlockController],
  providers: [BlockService, BlockRepository],
  exports: [BlockService, BlockRepository],
})
export class BlockModule {}
