import { Injectable } from '@nestjs/common';
// import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { UserRepository } from 'src/user/user.repository';
import { GameRepository } from './game.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/user/user.entity';
import { CreateGameDto } from './dto/create.game.dto';
@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private gameRepository: GameRepository,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async createGame(body: CreateGameDto) {
    const game = await this.gameRepository.createGame(
      body.game_mode,
      body.player1,
      body.player2,
    );
    return game;
  }

  async deleteGame(gameIdx: number) {
    const result = await this.gameRepository.delete(gameIdx);
    return result;
  }

  // 점수 업데이트, 유저 상태 변화(offline 상태 변화는 client팀과 같이 [home gateway]), 탈주 처리(비정상 종료)

  async updateGameResult(
    gameIdx: number,
    player1_score: number,
    player2_score: number,
  ) {
    const game = await this.gameRepository.findOne({ where: { idx: gameIdx } });
    game.player1_score = player1_score;
    game.player2_score = player2_score;
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

  // async abnormalOver(gameIdx: number) {}
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

  // 현재 user가 참가하고 있는 게임의 정보 얻기
  async getUserCurrentGameInfo(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    return user.current_game;
    // return user.current_game;
    // return user.current_game;
    // 아직 user에 current game 저장을 어떻게 할지 몰라서 진행을 못함.
    // const user = await this.userRepository.findOne({ where: { idx: userIdx } });
    // return this.gameRepository.getUserCurrentGameInfo(userIdx);
  }
}
