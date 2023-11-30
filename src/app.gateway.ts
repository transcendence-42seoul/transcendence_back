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
import { UserStatus } from 'src/user/user.entity';
import { Role } from './chat/chat.participant.entity';
import { ChatService } from './chat/chat.service';
import { UserRepository } from './user/user.repository';
import { ChatParticipantService } from './chat/chat.participant.service';
@WebSocketGateway({ namespace: 'appGateway' })
export class appGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly userRepository: UserRepository,
    private readonly chatParticipantService: ChatParticipantService,
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
      const userWithParticipants = await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.participants', 'participant')
        .leftJoinAndSelect('participant.chat', 'chat')
        .where('user.id = :id', { id: user.id })
        .getOne();

      user.participants = userWithParticipants
        ? userWithParticipants.participants
        : [];
    }

    for (let i = 0; i < user.participants.length; i++) {
      if (user.participants[i].role === Role.OWNER) {
        console.log(user.participants[i].chat.idx);
        await this.chatService.deleteChat(user.participants[i].chat.idx);
      } else {
        await this.chatParticipantService.leaveChat(
          userIdx,
          user.participants[i].chat.idx,
        );
      }
    }
    if (user) {
      await this.userService.deleteByIdx(userIdx);
    }
  }
}
