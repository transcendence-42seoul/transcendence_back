import { GameService } from './game.service';
import { MiniChatGateway } from './../mini-chat/miniChat.gateway';
import { Controller, Get, Post } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { CreateGameDto } from './dto/create.game.dto';

@Controller('game')
export class GameController {
  constructor(
    private readonly miniChatGateway: MiniChatGateway,
    private readonly gameService: GameService,
  ) {}
  @Get()
  connectGameSocket() {
    return 'hello this is game';
  }

  @Post('/request') // 지금은 못함, body 플레이어 모드, idx
  async acceptGame(@MessageBody() body: CreateGameDto) {
    // 그 유저 online 상태 상태인지 확인
    // db 생성 :
    const game = await this.gameService.createGame(body);
    // game entity idx로 소켓 room 생성

    // home socket room에서 A에게 성공 전송
    return game;
    // socket id를 room에 연결 => gateway쪽에서 처리
    // game ready page 이동 => 프론트엔드에서 설정
  }

  // 현재 내가 참가하고 있는 게임의 정보 얻기
  @Get('/info/:userIdx')
  async getUserCurrentHostInfo(@MessageBody() userId: string) {
    const game = await this.gameService.getUserCurrentHostInfo(userId);
    return game;
  }

  @Get('/info/:userIdx')
  async getUserCurrentGuestInfo(@MessageBody() userId: string) {
    const game = await this.gameService.getUserCurrentGuestInfo(userId);
    return game;
  }
  //playing game
  //game result
  @Get('/response')
  responseGame() {
    /**
     * 1. 2명의 user idx에게 game 보내주기
     */
  }
}
