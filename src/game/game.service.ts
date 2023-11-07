import { Injectable } from '@nestjs/common';
// import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { UserRepository } from 'src/user/user.repository';
import { GameRepository } from './game.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/user/user.entity';
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
  //게임, 종료 상태 변환 함수 / 탈주는 client팀 home gateway

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

  // findAll() {
  //   return `This action returns all game`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} game`;
  // }

  // update(id: number, updateGameDto: UpdateGameDto) {
  //   return `This action updates a #${id} game`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} game`;
  // }
}
