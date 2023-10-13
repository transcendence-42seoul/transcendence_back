import { IsNotEmpty } from 'class-validator';

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
    userDto.nickname = userData.login;
    userDto.email = userData.email;

    return userDto;
  }
}
