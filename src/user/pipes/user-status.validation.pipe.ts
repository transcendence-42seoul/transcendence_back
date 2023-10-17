import { BadRequestException, PipeTransform } from '@nestjs/common';
import { UserStatus } from '../user.entity';

export class UserStatusValidationPipe implements PipeTransform {
  readonly StatusOptions = [
    UserStatus.ONLINE,
    UserStatus.OFFLINE,
    UserStatus.PLAYING,
  ];

  transform(value: any) {
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} isn't in the status options`);
    }

    return value;
  }

  private isStatusValid(status: any) {
    const index = this.StatusOptions.indexOf(status);
    return index !== -1;
  }
}
