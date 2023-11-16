import { IsInt, IsNotEmpty } from 'class-validator';

export class JoinChatDto {
  @IsNotEmpty()
  @IsInt()
  room_id: number;
}
