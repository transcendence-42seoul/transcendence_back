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

  onlineUsers: {
    [key: number]: string;
  } = {};

  afterInit() {}

  private logger = new Logger('app');

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    const userData = await this.authService.parsingJwtData(token);
    const userIdx = userData.user_idx;
    delete this.onlineUsers[userIdx];

    try {
      await this.userService.updateStatus(userIdx, UserStatus.OFFLINE);
    } catch (error) {
      this.logger.error(`${userIdx}의 offline 업데이트 실패`);
    }
    this.logger.log('disconnected : ' + socket.id + ' in appGateway');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    const userData = await this.authService.parsingJwtData(token);
    const userIdx = userData.user_idx;
    this.onlineUsers[userIdx] = socket.id;

    try {
      await this.userService.updateStatus(userIdx, UserStatus.ONLINE);
    } catch (error) {
      this.logger.error(`${userIdx}의 offline 업데이트 실패`);
    }
    this.logger.log('connected : ' + socket.id + ' in appGateway');
  }

  // 챌린지 도전자 신청
  @SubscribeMessage('checkEnableChallengeGame')
  async checkEnableChallengeGame(
    @MessageBody() body: { requestedIdx: number },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('제발!!!');
    try {
      const userIdx = await this.getUserIdx(socket);
      const requester = await this.userService.getIsInclueGame(userIdx);
      const requested = await this.userService.getIsInclueGame(
        body.requestedIdx,
      );
      if (requester.include || requested.include) {
        socket.emit('checkEnableChallengeGameSuccess', {
          status: 'OFFLINE',
          success: false,
        });
        return;
      }

      if (requested.status === UserStatus.ONLINE) {
        socket.emit('checkEnableChallengeGameSuccess', {
          status: 'ONLINE',
          success: true,
        });
        const nickname = await this.userService.getNickname(userIdx);
        this.server
          .to(this.onlineUsers[body.requestedIdx])
          .emit('requestedChallenge', { nickname });
      } else if (
        requested.status === UserStatus.OFFLINE ||
        requested.status === UserStatus.PLAYING
      ) {
        socket.emit('checkEnableChallengeGameSuccess', {
          status: requested.status,
          success: false,
        });
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async getUserIdx(socket: Socket) {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    const userData = await this.authService.parsingJwtData(token);
    const userIdx = userData.user_idx;
    return userIdx;
  }
}
