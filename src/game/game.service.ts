import { Injectable } from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io';

@Injectable()
export class GameService {
  createGame(createGameDto: CreateGameDto) {
    return 'This action adds a new game';
  }

  findGameRoomIdOfUser(userId: string) {
    return 'This action returns game room id of user';
  }

  joinGame(socket: Socket, roomId: string) {
    socket.join(roomId);
  }

  leaveGame(socket: Socket, roomId: string) {
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
