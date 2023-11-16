import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Avatar } from './avatar.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AvatarRepository extends Repository<Avatar> {
  constructor(dataSource: DataSource) {
    super(Avatar, dataSource.createEntityManager());
  }

  async createAvatar(): Promise<Avatar> {
    const avatar = await this.standardAvatar();
    await this.save(avatar);
    return avatar;
  }

  async standardAvatar(): Promise<Avatar> {
    const imagePath = path.resolve(
      __dirname,
      '..',
      '..',
      'src',
      'img',
      'transcendence_owner.jpg',
    );
    const imgBuffer = fs.readFileSync(imagePath);

    const avatar = this.create({
      image_data: imgBuffer,
    });
    return avatar;
  }
}
