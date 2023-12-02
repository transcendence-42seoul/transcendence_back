import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class BanChatDto {
  @IsNotEmpty()
  @IsString()
  chatIdx: string;

  @IsNotEmpty()
  @IsInt()
  bannedIdx: number;
}
