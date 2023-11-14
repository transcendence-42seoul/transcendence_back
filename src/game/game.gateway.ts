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
import { KyeEventDto } from './dto/key.event.dto';

@WebSocketGateway({ namespace: 'games' })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly gameService: GameService) {}
  private logger = new Logger('games');

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('disconnected : ' + socket.id);
    const roomId = [...socket.rooms.values()][1];
    if (roomId === undefined) return;
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
    this.gameService.joinGameRoom(socket, body.room_id);
    this.logger.log(socket.id + ' join in ' + body.room_id);
  }

  @SubscribeMessage('joinTestGame')
  joinTestGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGameRoom(socket, 'testRoom');
    this.logger.log(socket.id + ' join in ' + body.room_id);
  }

  @SubscribeMessage('startGame')
  startGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {}

  @SubscribeMessage('keyEvent')
  keyEvent(
    @MessageBody() body: KyeEventDto,
    @ConnectedSocket() socket: Socket,
  ) {}

  @SubscribeMessage('leaveGame')
  leaveGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.leaveGameRoom(socket, body.room_id);
    this.logger.log(socket.id + ' leave in ' + body.room_id);
  }

  @SubscribeMessage('new_chat') // 해당하는 이벤트를 찾는다. 이 이벤트 이름은 프론트엔드에서 보내주는 이벤트 이름과 같아야한다.
  handleChat(
    @MessageBody() chat: string,
    @ConnectedSocket() socket: Socket, // 이 소켓으로 서버는 emit, on을 할 수 있다.
  ) {
    if ([...socket.rooms.values()].length < 2) return;
    const roomIdValue = [...socket.rooms.values()][1];
    this.logger.log('new_chat : ' + chat + ' in ' + roomIdValue);
    socket.to(roomIdValue).emit('receiveMessage', chat); // 자신을 제외한 모든 소켓에게 메시지를 보낸다. (자신에게는 보내지 않는다.)
  }
}
