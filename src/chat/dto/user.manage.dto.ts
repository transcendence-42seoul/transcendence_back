import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UserManagementDto {
  @IsNotEmpty()
  @IsString()
  chatIdx: string;

  @IsNotEmpty()
  @IsInt()
  managedIdx: number;
}
