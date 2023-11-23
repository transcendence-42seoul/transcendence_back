// import { PickType } from '@nestjs/swagger';
// import { Cat } from 'src/cats/cats.schema';

import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsInt()
  user_idx: number;
}
