import { PartialType } from '@nestjs/mapped-types';
import { CreateMiniChatDto } from './create-chat.dto';

export class UpdateMiniChatDto extends PartialType(CreateMiniChatDto) {
  id: number;
}
