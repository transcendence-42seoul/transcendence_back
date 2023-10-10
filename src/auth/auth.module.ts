import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { User } from './user.entity';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  // import { User } from './user.entity';
  controllers: [AuthController],
  providers: [AuthService, UserRepository],
})
export class AuthModule {}
