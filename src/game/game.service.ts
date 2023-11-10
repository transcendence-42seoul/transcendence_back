import { Injectable } from '@nestjs/common';
// import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { UserRepository } from 'src/user/user.repository';
import { GameRepository } from './game.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/user/user.entity';
import { CreateGameDto } from './dto/create.game.dto';
import { RecordService } from 'src/record/record.service';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private gameRepository: GameRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private readonly recordService: RecordService,
  ) {}

  async createGame(body: CreateGameDto) {
    const game = await this.gameRepository.createGame(
      body.game_mode,
      body.gameHost,
      body.gameGuest,
    );
    return game;
  }

  async finishGame(gameIdx: number) {
    const game = await this.gameRepository.findOne({ where: { idx: gameIdx } });
    const winner =
      game.gameHost_score > game.gameGuest_score
        ? game.game_host
        : game.game_guest;

    game.game_host.record.total_game += 1;
    game.game_guest.record.total_game += 1;
    winner.record.total_win += 1;
    if (game.game_mode >= 2) {
      game.game_host.record.ladder_game += 1;
      game.game_guest.record.ladder_game += 1;
      winner.record.ladder_win += 1;
    } else {
      game.game_host.record.general_game += 1;
      game.game_guest.record.general_game += 1;
      winner.record.general_win += 1;
    }
    game.game_host.status = UserStatus.ONLINE;
    game.game_guest.status = UserStatus.ONLINE;
    game.game_status = false;

    try {
      await this.recordService.updateRecord(
        game.game_host.idx,
        game.game_host.record,
      );
      await this.recordService.updateRecord(
        game.game_guest.idx,
        game.game_guest.record,
      );
    } catch (error) {
      console.log(error);
    }
    const finish = await this.gameRepository.delete(gameIdx);
    return finish;
  }

  async abnormalGame(gameIdx: number) {
    const game = await this.gameRepository.findOne({ where: { idx: gameIdx } });
    const connectUser =
      game.game_host.status === UserStatus.ONLINE
        ? game.game_host
        : game.game_guest;
    connectUser.record.total_game += 1;
    connectUser.record.total_win += 1;
    if (game.game_mode >= 2) {
      connectUser.record.ladder_game += 1;
      connectUser.record.ladder_win += 1;
    } else {
      connectUser.record.general_game += 1;
      connectUser.record.general_win += 1;
    }
    connectUser.status = UserStatus.ONLINE;
    const finish = await this.gameRepository.delete(gameIdx);
    return finish;
  }

  // 점수 업데이트, 유저 상태 변화(offline 상태 변화는 client팀과 같이 [home gateway]), 탈주 처리(비정상 종료)

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
  //finish game 구현 시 game_status > false로 변경

  // game 요청

  // game 수락
  async acceptBattle() {}

  // findGameRoomIdOfUser(userId: string) {
  //   return 'This action returns game room id of user';
  // }

  joinGameRoom(socket: Socket, roomId: string) {
    socket.join(roomId);
  }

  leaveGameRoom(socket: Socket, roomId: string) {
    socket.leave(roomId);
  }

  // 현재 user가 참가하고 있는 게임의 정보 얻기 -> 관전자도 사용해야하는 api(id 로 찾아야할듯...)
  async getUserHostGameInfo(userIdx: number) {
    const user = await this.userRepository.findOne({
      where: { idx: userIdx },
    });
    /**
     * user{
     *  current_game =>
     * }
     *
     * game {
     *  game_host =>
     *  game_guest =>
     * }
     *
     */

    // seokchoi =>
    // sangehan =>
    // const gameList = user.host;
    // let game = await this.gameRepository.findOne({
    //   where: { game_host: user.host, game_status: true },
    // });
    // if (!game) {
    //   game = await this.gameRepository.findOne({
    //     where: { game_guest: user.host, game_status: true },
    //   });
    // }

    return user.host;
    // return user.current_game;
    // return user.current_game;
    // 아직 user에 current game 저장을 어떻게 할지 몰라서 진행을 못함.
    // const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    // return this.gameRepository.getUserCurrentGameInfo(userIdx);
  }

  async getUserGuestGameInfo(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    return user.guest;
  }
}
