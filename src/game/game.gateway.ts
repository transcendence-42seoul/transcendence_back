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
    const roomId = socket.rooms.values().next().value;
    this.gameService.leaveGameRoom(socket, roomId);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected : ' + socket.id);
  }

  afterInit() {
    this.logger.log('init');
  }
  // 특정 room에 속한 모든 socket 내보내기
  // @SubscribeMessage('deleteRoom') // 클라이언트에서 "leaveRoom" 메시지를 보내면 실행
  // handleLeaveRoom(client: Socket, data: { roomName: string }) {
  //   const { roomName } = data;
  //   // 특정 room에 속한 모든 클라이언트 ID 가져오기
  //   client.server.in(roomName).allSockets().then((socketIds) => {
  //     socketIds.forEach((socketId) => {
  //       const socket = client.server.sockets.get(socketId);
  //       if (socket) {
  //         socket.leave(roomName); // 모든 소켓을 room에서 나가게 함
  //       }
  //     });
  //   });
  // }

  @SubscribeMessage('joinGame')
  joinGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGameRoom(socket, body.room_id.toString());
    this.logger.log(socket.id + ' join in ' + body.room_id.toString());
  }

  @SubscribeMessage('joinTestGame')
  joinTestGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGameRoom(socket, 'testRoom');
    this.logger.log(socket.id + ' join in ' + body.room_id.toString());
  }

  @SubscribeMessage('startGame')
  startGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGameRoom(socket, 'testRoom');
    this.logger.log(socket.id + ' join in ' + body.room_id.toString());
  }

  @SubscribeMessage('leaveGame')
  leaveGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.leaveGameRoom(socket, body.room_id.toString());
    this.logger.log(socket.id + ' leave in ' + body.room_id.toString());
  }
}
