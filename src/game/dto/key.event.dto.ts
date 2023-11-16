import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export type KyeEvent = 'keyUp' | 'keyDown' | 'keyIdle';
type Identity = 'Host' | 'Guest';

export class KyeEventDto {
  @IsNotEmpty()
  @IsInt()
  key: KyeEvent;

  @IsNotEmpty()
  @IsString()
  room_id: string;

  @IsNotEmpty()
  @IsString()
  identity: Identity;
}
