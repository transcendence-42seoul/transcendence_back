import { IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  chat_idx: number;

  @IsNotEmpty()
  user_idx: number;

  @IsNotEmpty()
  send_at: Date;

  static convertDto(messageData: any): CreateMessageDto {
    const messageDto = new CreateMessageDto();
    messageDto.content = messageData.content;
    messageDto.chat_idx = messageData.chat_idx;
    messageDto.user_idx = messageData.user_idx;
    messageDto.send_at = messageData.send_at;

    return messageDto;
  }
}
