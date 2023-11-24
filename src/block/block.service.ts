import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/user/user.repository';
import { BlockRepository } from './block.repository';
import { User } from 'src/user/user.entity';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(BlockRepository)
    private blockRepository: BlockRepository,
  ) {}

  async blockUser(blockerIdx: number, blockedIdx: number): Promise<void> {
    const blocker = await this.userRepository.findOne({
      where: { idx: blockerIdx },
    });
    if (!blocker)
      throw new NotFoundException(`User with idx "${blockerIdx}" not found`);
    const blocked = await this.userRepository.findOne({
      where: { idx: blockedIdx },
    });
    if (!blocked)
      throw new NotFoundException(`User with idx "${blockedIdx}" not found`);

    const existBlock = await this.blockRepository.findOne({
      where: { blocker: { idx: blockerIdx }, blocked: blockedIdx },
    });
    if (existBlock)
      throw new NotFoundException(
        `Block with blocker "${blockerIdx}" and blocked "${blockedIdx}" already exist`,
      );

    const block = await this.blockRepository.create({
      blocker,
      blocked: blockedIdx,
    });
    await this.blockRepository.save(block);
  }

  async unBlockUser(blockerIdx: number, blockedIdx: number): Promise<void> {
    const blockerUser = await this.userRepository.findOne({
      where: { idx: blockerIdx },
    });
    if (!blockerUser)
      throw new NotFoundException(`User with idx "${blockerIdx}" not found`);
    const blockedUser = await this.userRepository.findOne({
      where: { idx: blockedIdx },
    });
    if (!blockedUser)
      throw new NotFoundException(`User with idx "${blockedIdx}" not found`);

    const block = await this.blockRepository.findOne({
      where: { blocker: { idx: blockerIdx }, blocked: blockedIdx },
    });
    if (!block)
      throw new NotFoundException(
        `Block with blocker "${blockerIdx}" and blocked "${blockedIdx}" not found`,
      );

    await this.blockRepository.remove(block);
  }

  async getBlockList(blockerIdx: number): Promise<User[]> {
    const blockerUser = await this.userRepository.findOne({
      where: { idx: blockerIdx },
    });
    if (!blockerUser)
      throw new NotFoundException(`User with idx "${blockerIdx}" not found`);

    const blockList = blockerUser.blocker;
    if (!blockList || blockList.length === 0) return [];

    const blockedList: User[] = [];
    for (const block of blockList) {
      const idx = block.blocked;
      const user = await this.userRepository.findOne({ where: { idx } });
      blockedList.push(user);
    }

    return blockedList;
  }
}
