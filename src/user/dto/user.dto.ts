import { IsNotEmpty } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
export class UserDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  email: string;

  static convertDto(userData: any): UserDto {
    const userDto = new UserDto();
    userDto.id = userData.login;
    userDto.nickname = uuidv4();
    userDto.email = userData.email;

    return userDto;
  }
}
