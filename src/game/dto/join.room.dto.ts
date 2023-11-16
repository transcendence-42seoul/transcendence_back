import { IsInt, IsNotEmpty } from 'class-validator';

export class JoinRoomDto {
  @IsNotEmpty()
  @IsInt()
  room_id: string;
}
