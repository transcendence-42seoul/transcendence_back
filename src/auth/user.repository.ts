import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  //   constructor(dataSource: DataSource) {
  //     super(User, dataSource.createEntityManager());
  //   }
  //   async createUser(): Promise<void> {}
}
