import { IsNotEmpty, IsString } from 'class-validator';

export class AvatarDto {
  @IsNotEmpty()
  @IsString()
  image_data: string;

  static convertDto(userData: any): AvatarDto {
    const avatarDto = new AvatarDto();
    avatarDto.image_data = userData.image_data;

    return avatarDto;
  }

  toBuffer(): Buffer {
    return Buffer.from(this.image_data, 'base64');
  }
}
