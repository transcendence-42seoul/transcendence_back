import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';
import { GameRepository } from './game.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private gameRepository: GameRepository,
  ) {}

  async createGame(createGameDto: CreateGameDto) {
    await this.gameRepository.createGame(createGameDto);
    return 'This action adds a new game';
  }

  // removeGame(gameTableIndex: number): Promise<void> {
  //   const game = this.gameTables[gameTableIndex];
  //   if (!game)
  //     throw new Error(`Game with index ${gameTableIndex} does not exist`);
  // }

  findGameRoomIdOfUser(userId: string) {
    return 'This action returns game room id of user';
  }

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
