import { IsNotEmpty } from 'class-validator';
import { User } from '../user.entity';

export class UserDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  nickname: string;

  @IsNotEmpty()
  email: string;

  static convertDto(user: User): UserDto {
    const userDto = new UserDto();
    userDto.id = user.id;
    userDto.nickname = user.nickname;
    userDto.email = user.email;

    return userDto;
  }
}
