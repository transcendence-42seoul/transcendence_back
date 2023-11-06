import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
// import { UpdateGameDto } from './dto/update-game.dto';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'games' })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly gameService: GameService) {}
  private logger = new Logger('chat'); // 테스트용 다쓰면 지워도 됨.

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    //
    this.logger.log('disconnected : ' + socket.id);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected : ' + socket.id);
  }

  afterInit() {
    this.logger.log('init');
  }

  @SubscribeMessage('joinGame')
  create(
    @MessageBody() createGameDto: CreateGameDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGame(socket, 'roomId');
  }

  // @SubscribeMessage('createGame')
  // create(@MessageBody() createGameDto: CreateGameDto) {
  //   return this.gameService.create(createGameDto);
  // }

  // @SubscribeMessage('findAllGame')
  // findAll() {
  //   return this.gameService.findAll();
  // }

  // @SubscribeMessage('findOneGame')
  // findOne(@MessageBody() id: number) {
  //   return this.gameService.findOne(id);
  // }

  // @SubscribeMessage('updateGame')
  // update(@MessageBody() updateGameDto: UpdateGameDto) {
  //   return this.gameService.update(updateGameDto.id, updateGameDto);
  // }

  // @SubscribeMessage('removeGame')
  // remove(@MessageBody() id: number) {
  //   return this.gameService.remove(id);
  // }
}
