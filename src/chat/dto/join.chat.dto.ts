import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class JoinChatDto {
  @IsNotEmpty()
  @IsInt()
  room_id: number;

  @IsOptional()
  @IsString()
  password: string;
}
