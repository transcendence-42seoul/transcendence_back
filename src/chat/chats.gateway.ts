import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { JoinChatDto } from './dto/join.chat.dto';

@WebSocketGateway({ namespace: 'chats' })
export class ChatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}
  private logger = new Logger('chat'); // 테스트용 다쓰면 지워도 됨.

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('disconnected : ' + socket.id);
    //   const roomId = socket.rooms.values().next().value;
    //   this.gameService.leaveGameRoom(socket, roomId);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected : ' + socket.id);
  }

  afterInit() {
    this.logger.log('init');
  }

  @SubscribeMessage('joinChat')
  joinGame(
    @MessageBody() body: JoinChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(body.room_id.toString());
    this.logger.log(socket.id + ' join in ' + body.room_id.toString());
  }

  //   @SubscribeMessage('leaveGame')
  //   leaveGame(
  //     @MessageBody() body: JoinRoomDto,
  //     @ConnectedSocket() socket: Socket,
  //   ) {
  //     this.gameService.leaveGameRoom(socket, body.room_id.toString());
  //     this.logger.log(socket.id + ' leave in ' + body.room_id.toString());
  //   }
}
