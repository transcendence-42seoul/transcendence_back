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
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join.room.dto';

@WebSocketGateway({ namespace: 'games' })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly gameService: GameService) {}
  private logger = new Logger('chat'); // 테스트용 다쓰면 지워도 됨.

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('disconnected : ' + socket.id);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected : ' + socket.id);
  }

  afterInit() {
    this.logger.log('init');
  }

  @SubscribeMessage('joinGame')
  joinGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGameRoom(socket, body.room_id.toString());
  }

  @SubscribeMessage('leaveGame')
  leaveGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.leaveGameRoom(socket, body.room_id.toString());
  }
}
