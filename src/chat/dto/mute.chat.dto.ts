import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class MuteChatDto {
  @IsNotEmpty()
  @IsString()
  chatIdx: string;

  @IsNotEmpty()
  @IsInt()
  mutedIdx: number;
}
