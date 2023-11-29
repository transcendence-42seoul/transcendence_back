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

    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = await this.authService.parsingJwtData(token.toString());
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

  // @SubscribeMessage('login')
  // async login(@ConnectedSocket() socket: Socket) {
  //   const userIdx = socket.data.userIdx;
  //   const user = await this.userService.findByIdx(userIdx);
  //   if (user) {
  //     await this.userService.updateStatus(userIdx, UserStatus.ONLINE);
  //   }
  // }

  @SubscribeMessage('logout')
  async logout(@ConnectedSocket() socket: Socket) {
    const userIdx = socket.data.userIdx;
    const user = await this.userService.findByIdx(userIdx);
    if (user) {
      await this.userService.updateStatus(userIdx, UserStatus.OFFLINE);
    }
  }
  @SubscribeMessage('withdrawal')
  async withdrawal(@ConnectedSocket() socket: Socket) {
    const userIdx = socket.data.userIdx;
    const user = await this.userService.findByIdx(userIdx);
    if (user) {
      await this.userService.deleteByIdx(userIdx);
    }
  }
}
