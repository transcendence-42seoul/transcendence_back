import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateChatDto {
  @IsNotEmpty()
  @IsNumber()
  chatIdx: number;

  @IsOptional()
  @IsString()
  password: string;
}

export default UpdateChatDto;
