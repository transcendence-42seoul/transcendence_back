import { IsNotEmpty } from 'class-validator';

export class OnlineUserDto {
  @IsNotEmpty()
  idx: number;

  @IsNotEmpty()
  nickname: string;

  static convertDto(userData: any): OnlineUserDto {
    const userDto = new OnlineUserDto();
    userDto.idx = userData.idx;
    userDto.nickname = userData.nickname;

    return userDto;
  }
}
