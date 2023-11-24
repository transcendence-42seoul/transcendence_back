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
import { ChatParticipantService } from './chat.participant.service';
import { ChatMessageService } from './chat.message.service';
import { ChatParticipant } from './chat.participant.entity';
import { ChatType } from './chat.entity';
import { ChatMessageDto } from './dto/chat.message.dto';
import { AuthService } from 'src/auth/auth.service';
import CreateChatDto from './dto/chat.create.dto';

@WebSocketGateway({ namespace: 'chats' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly chatParticipantService: ChatParticipantService,
    private readonly chatMessageSerive: ChatMessageService,
  ) {}
  private logger = new Logger('chats'); // 테스트용 다쓰면 지워도 됨.

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('disconnected : ' + socket.id);
    // 어떤방도 참여하지 않았을 경우
    if ([...socket.rooms.values()].length < 2) return;

    // 첫 번째 방은 클라이언트의 소켓 id에 해당하므로, 두 번째 방부터 처리
    // 클라이언트는 연결 시 자동으로 자신의 소켓 id와 동일한 이름의 방에 참여
    const rooms = [...socket.rooms.values()].slice(1);
    for (const roomId of rooms) {
      if (roomId === undefined) return;
      this.chatService.leaveChatRoom(socket, roomId);
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected : ' + socket.id);

    const token = socket.handshake.query.token;
    if (token) {
      try {
        const decoded = await this.authService.validateToken(token.toString());
        socket.data.userIdx = decoded.user_idx;
      } catch (error) {
        this.logger.error('Invalid token:', error);
        socket.disconnect();
      }
    } else {
      this.logger.error('No token provided');
      socket.disconnect();
    }
  }

  afterInit() {
    this.logger.log('init');
  }

  @SubscribeMessage('createChat')
  async createChat(
    @MessageBody() body: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const userIdx = socket.data.userIdx;
    const name = body.title;
    const password = body.password;
    const limit = parseInt(body.maxPeople, 10);

    try {
      if (password === '') {
        const chat = await this.chatService.createPublic(userIdx, name, limit);
        return { status: 'success', chat: chat };
      } else {
        const chat = await this.chatService.createPrivate(
          userIdx,
          name,
          password,
          limit,
        );
        return { status: 'success', chat: chat };
      }
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('joinChat')
  async joinChat(
    @MessageBody() body: JoinChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const userIdx = socket.data.userIdx;
    const chatIdx = body.room_id;
    const password = body.password;

    let participant: ChatParticipant;

    const chat = await this.chatService.getChatByIdx(chatIdx);

    try {
      if (chat.type === ChatType.PRIVATE) {
        participant = await this.chatParticipantService.joinPrivateChat(
          userIdx,
          chatIdx,
          password,
        );
      } else if (chat.type === ChatType.PUBLIC) {
        participant = await this.chatParticipantService.joinPublicChat(
          userIdx,
          chatIdx,
        );
      }

      this.chatService.joinChatRoom(socket, `room-${chatIdx}`);
      return { status: 'success', participant: participant };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() chatMessageDto: ChatMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const room = `room-${chatMessageDto.room_id}`;
    const message = chatMessageDto.message;

    this.chatMessageSerive.createChatMessage(
      chatMessageDto.room_id,
      socket.data.userIdx,
      message,
    );

    socket.broadcast.to(room).emit('receiveMessage', message);
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
