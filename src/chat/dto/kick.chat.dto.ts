import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class KickChatDto {
  @IsNotEmpty()
  @IsString()
  chatIdx: string;

  @IsNotEmpty()
  @IsInt()
  kickedIdx: number;
}
