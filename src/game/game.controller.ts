import { MiniChatGateway } from './../mini-chat/miniChat.gateway';
import { Controller, Get } from '@nestjs/common';

@Controller('game')
export class GameController {
  constructor(private readonly miniChatGateway: MiniChatGateway) {}
  @Get()
  connectGameSocket() {
    return 'hello this is game';
  }
}
