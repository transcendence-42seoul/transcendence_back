import { OnGatewayDisconnect } from '@nestjs/websockets/interfaces/hooks/on-gateway-disconnect.interface';
import { OnGatewayConnection } from '@nestjs/websockets/interfaces/hooks/on-gateway-connection.interface';
import { OnGatewayInit } from '@nestjs/websockets/interfaces/hooks/on-gateway-init.interface';
import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { MiniChatService } from './miniChat.service';
import { CreateMiniChatDto } from './dto/create-chat.dto';
import { UpdateMiniChatDto } from './dto/update-chat.dto';
import { Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'gameChat' })
export class MiniChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: MiniChatService) {}
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

  private logger = new Logger('chat'); // 테스트용 다쓰면 지워도 됨.

  @SubscribeMessage('createChat')
  create(@MessageBody() createChatDto: CreateMiniChatDto) {
    return this.chatService.create(createChatDto);
  }

  @SubscribeMessage('findAllChat')
  findAll() {
    return this.chatService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateMiniChatDto) {
    return this.chatService.update(updateChatDto.id, updateChatDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatService.remove(id);
  }

  @SubscribeMessage('new_chat') // 해당하는 이벤트를 찾는다. 이 이벤트 이름은 프론트엔드에서 보내주는 이벤트 이름과 같아야한다.
  handleChat(
    @MessageBody() chat: string,
    @ConnectedSocket() socket: Socket, // 이 소켓으로 서버는 emit, on을 할 수 있다.
  ) {
    this.logger.log('new chat event 발생!!');
    socket.broadcast.emit('receiveMessage', chat);
  }
}
