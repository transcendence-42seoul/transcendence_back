import { JwtService } from '@nestjs/jwt';
import { GameService } from './game.service';
import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Request,
  Res,
  Response,
  UseGuards,
} from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';
import { CreateGameDto } from './dto/create.game.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { AuthService } from 'src/auth/auth.service';

@Controller('gamegame')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/jwt')
  async getJwtData(@Request() req, @Response() res) {
    console.log('잘 들어왔나 확인을 해야합니다. ' + req.user);
    try {
      const data = await this.authService.parsingJwtData(req.user);

      console.log(data);
    } catch (error) {
      res.status(500).send('에러가 난 것 같아 jwt parsing에서');
    }
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

  @Post('/finish')
  async finishGame(@Body('gameIdx', ParseIntPipe) gameIdx: number) {
    const game = await this.gameService.finishGame(gameIdx);
    return game;
  }

  // 현재 내가 참가하고 있는 게임의 정보 얻기
  @Get('/info/:userIdx')
  async getUserHostGameInfo(@MessageBody() userIdx: number) {
    const game = await this.gameService.getUserHostGameInfo(userIdx);
    return game;
  }

  // @Get('/info/:userIdx')
  // async getUserGuestGameInfo(@MessageBody() userIdx: number) {
  //   const game = await this.gameService.getUserGuestGameInfo(userIdx);
  //   return game;
  // }
  //playing game
  //game result
  @Get('/response')
  responseGame() {
    /**
     * 1. 2명의 user idx에게 game 보내주기
     */
  }
}
