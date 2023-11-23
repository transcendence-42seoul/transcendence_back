import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsInt()
  room_id: number;

  @IsNotEmpty()
  @IsString()
  message: string;
}
