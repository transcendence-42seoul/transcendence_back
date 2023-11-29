import { UserService } from './user/user.service';
import { AuthService } from 'src/auth/auth.service';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { GameService } from './game/game.service';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './game/dto/join.room.dto';
import { UserStatus } from 'src/user/user.entity';

@WebSocketGateway({ namespace: 'appGateway' })
export class appGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  afterInit() {}

  private logger = new Logger('games');

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('disconnected : ' + socket.id + ' in appGateway');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected : ' + socket.id + ' in appGateway');
  }

  // 프론트에서는 recieve challenge 이벤트 (id) =>
  @SubscribeMessage('challengeGame')
  async challengeGame(
    @MessageBody() body: { requesterId: string; requestedId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    const requester = await this.userService.getIsInclueGame(body.requesterId);
    const requested = await this.userService.getIsInclueGame(body.requestedId);
    if (requester.include || requested.include) {
      socket.emit('challengeResult', { status: 'OFFLINE', success: false });
      return;
    }

    if (requested.status === UserStatus.ONLINE) {
      socket.emit('challengeResult', { status: 'ONLINE', success: true });
    } else if (
      requested.status === UserStatus.OFFLINE ||
      requested.status === UserStatus.PLAYING
    ) {
      socket.emit('challengeResult', {
        status: requested.status,
        success: false,
      });
    }
  }
}
