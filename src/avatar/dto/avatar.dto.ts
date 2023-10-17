import { IsNotEmpty } from 'class-validator';

export class AvatarDto {
  @IsNotEmpty()
  id: string;

  static convertDto(userData: any): AvatarDto {
    const avatarDto = new AvatarDto();
    avatarDto.id = userData.login;

    return avatarDto;
  }
}
