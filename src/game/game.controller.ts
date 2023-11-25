import { GameService } from './game.service';
import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { AuthService } from 'src/auth/auth.service';

@Controller('games')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
  ) {}

  // 현재 내가 참가하고 있는 게임의 정보 얻기
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserHostGameInfo(@Response() res, @Request() req) {
    try {
      const userIdx = req.user.user_idx;
      const game = await this.gameService.getUserGame(userIdx);
      res.status(200).send(game);
    } catch (error) {
      res.status(401).send('game 정보가 없습니다. ');
    }
  }
}
