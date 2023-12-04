import { UserService } from './../user/user.service';
import { Injectable } from '@nestjs/common';
// import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { UserRepository } from 'src/user/user.repository';
import { GameRepository } from './game.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/user/user.entity';
import { CreateGameDto } from './dto/create.game.dto';
import { RecordService } from 'src/record/record.service';
import { Logger } from '@nestjs/common';
import { RankingService } from 'src/ranking/ranking.service';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private gameRepository: GameRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly recordService: RecordService,
    private readonly userService: UserService,
    private readonly rankingService: RankingService,
  ) {}
  private logger = new Logger('chat');

  async createGame(body: CreateGameDto) {
    const game = await this.gameRepository.createGame(
      body.game_mode,
      body.gameHost,
      body.gameGuest,
    );
    return game;
  }

  async finishGame(
    roomId: string,
    winner: 'host' | 'guest',
    host_score: number,
    guest_score: number,
  ) {
    const game = await this.gameRepository.findOne({
      where: { room_id: roomId },
    });
    const gameHost = await game.game_host;
    const gameGuest = await game.game_guest;
    const gameWinner = winner === 'host' ? gameHost : gameGuest;
    gameHost.record.total_game += 1;
    gameGuest.record.total_game += 1;
    gameWinner.record.total_win += 1;

    if (game.game_mode <= 2) {
      gameHost.record.ladder_game += 1;
      gameGuest.record.ladder_game += 1;
      gameWinner.record.ladder_win += 1;
      gameHost.ranking.score -= 20;
      gameGuest.ranking.score -= 20;
      gameWinner.ranking.score += 40;
      try {
        await this.rankingService.updateRankingScore(
          gameHost.idx,
          gameHost.ranking.score,
        );
        await this.rankingService.updateRankingScore(
          gameGuest.idx,
          gameGuest.ranking.score,
        );
      } catch (error) {
        this.logger.error(error);
      }
    } else {
      gameHost.record.general_game += 1;
      gameGuest.record.general_game += 1;
      gameWinner.record.general_win += 1;
    }
    try {
      await this.recordService.updateRecord(gameHost.idx, gameHost.record);
      await this.recordService.updateRecord(gameGuest.idx, gameGuest.record);
      await this.userService.updateStatus(gameHost.idx, UserStatus.ONLINE);
      await this.userService.updateStatus(gameGuest.idx, UserStatus.ONLINE);
    } catch (error) {
      this.logger.error(error);
    }
    const hostGameHistory = {
      win: winner === 'host' ? true : false,
      game_type: game.game_mode,
      my_score: host_score,
      opponent_score: guest_score,
      opponent_id: gameGuest.id,
      opponent_nickname: gameGuest.nickname,
      time: game.start_time,
    };
    const guestGameHistory = {
      win: winner === 'guest' ? true : false,
      game_type: game.game_mode,
      my_score: guest_score,
      opponent_score: host_score,
      time: game.start_time,
      opponent_id: gameHost.id,
      opponent_nickname: gameHost.nickname,
    };

    try {
      this.recordService.addGameHistory(gameHost.idx, hostGameHistory);
      this.recordService.addGameHistory(gameGuest.idx, guestGameHistory);
    } catch (error) {
      this.logger.error(error);
    }
    const finish = await this.gameRepository.delete(game.idx);
    return finish;
  }

  async updateGameResult(
    gameIdx: number,
    gameHost_score: number,
    gameGuest_score: number,
  ) {
    const game = await this.gameRepository.findOne({ where: { idx: gameIdx } });
    game.gameHost_score = gameHost_score;
    game.gameGuest_score = gameGuest_score;
    await this.gameRepository.save(game);
    return game;
  }

  async userStatusChange(userIdx: number) {
    const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    if (!user) {
      return;
    }
    const newStatus =
      user.status === UserStatus.ONLINE
        ? UserStatus.PLAYING
        : UserStatus.ONLINE;
    await this.userRepository.update(userIdx, { status: newStatus });
  }

  joinGameRoom(socket: Socket, roomId: string) {
    socket.join(roomId);
  }

  leaveGameRoom(socket: Socket, roomId: string) {
    socket.leave(roomId);
  }

  async getUserGame(userIdx: number) {
    const game = await this.gameRepository.findOne({
      where: [
        { game_host: { idx: userIdx } },
        { game_guest: { idx: userIdx } },
      ],
      relations: ['game_host', 'game_guest'],
    });
    if (game) return game;
    return null;
  }

  async getUserGuestGameInfo(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    return user.guest;
  }
}
