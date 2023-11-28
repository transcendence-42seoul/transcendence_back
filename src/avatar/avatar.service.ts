import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AvatarRepository } from './avatar.repository';
import { AvatarDto } from './dto/avatar.dto';
import { Avatar } from './avatar.entity';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(AvatarRepository)
    private avatarRepository: AvatarRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async findByIdx(idx: number): Promise<Avatar> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`Can't find user with idx ${idx}`);
    const avatar = user.avatar;
    if (!avatar) throw new NotFoundException(`Can't find User ${idx}'s avatar`);

    return avatar;
  }

  async updateAvatar(idx: number, file: any): Promise<Avatar> {
    if (!file) throw new NotFoundException(`Can't find file`);
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`Can't find user with idx ${idx}`);
    const avatar = user.avatar;
    if (!avatar) throw new NotFoundException(`Can't find User ${idx}'s avatar`);

    const avatarDto = new AvatarDto();
    avatarDto.image_data = file.buffer;

    try {
      if (avatarDto.image_data !== undefined)
        avatar.image_data = avatarDto.toBuffer();

      return await this.avatarRepository.save(avatar);
    } catch (error) {
      throw error;
    }
  }

  async deleteByIdx(idx: number): Promise<Avatar> {
    const user = await this.userRepository.findOne({ where: { idx } });
    if (!user) throw new NotFoundException(`Can't find user with idx ${idx}`);
    const avatar = user.avatar;
    if (!avatar) throw new NotFoundException(`Can't find User ${idx}'s avatar`);

    const newAvatar = await this.avatarRepository.standardAvatar();

    return this.updateAvatar(idx, AvatarDto.convertDto(newAvatar));
  }
}
