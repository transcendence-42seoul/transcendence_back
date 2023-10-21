import { Injectable } from '@nestjs/common';
import { CreateMiniChatDto } from './dto/create-chat.dto';
import { UpdateMiniChatDto } from './dto/update-chat.dto';

@Injectable()
export class MiniChatService {
  create(createMiniChatDto: CreateMiniChatDto) {
    return 'This action adds a new chat';
  }

  findAll() {
    return `This action returns all chat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateMiniChatDto: UpdateMiniChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
