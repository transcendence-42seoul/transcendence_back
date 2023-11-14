import { IsInt, IsNotEmpty } from 'class-validator';

type KyeEvent = 'keyUp' | 'keyDown' | 'keyIdle';

export class KyeEventDto {
  @IsNotEmpty()
  @IsInt()
  key: KyeEvent;
}
