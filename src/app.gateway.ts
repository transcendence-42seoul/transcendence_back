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
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserStatus } from 'src/user/user.entity';
import { Role } from './chat/chat.participant.entity';
import { ChatService } from './chat/chat.service';
import { UserRepository } from './user/user.repository';
import { ChatParticipantService } from './chat/chat.participant.service';
import { FriendService } from './friend/friend.service';
import { AlarmDto } from './alarm/dto/alarm.dto';
import { AlarmType } from './alarm/alarm.entity';
import { AlarmService } from './alarm/alarm.service';
import { BlockService } from './block/block.service';

export const onlineUsers: {
  [key: number]: Socket;
} = {};

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
    private readonly friendService: FriendService,
    private readonly alarmService: AlarmService,
    private readonly blockService: BlockService,
    private readonly userRepository: UserRepository,
    private readonly chatParticipantService: ChatParticipantService,
  ) {}

  afterInit() {}

  private logger = new Logger('app');

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    const userData = await this.authService.parsingJwtData(token);
    const userIdx = userData.user_idx;
    delete onlineUsers[userIdx];

    try {
      await this.userService.updateStatus(userIdx, UserStatus.OFFLINE);
    } catch (error) {
      this.logger.error(`${userIdx}의 offline 업데이트 실패`);
    }
    this.logger.log('disconnected : ' + socket.id + ' in appGateway' + userIdx);

    const onlineUserListPromises = Object.keys(onlineUsers).map(async (key) => {
      const user = await this.userService.findByIdx(parseInt(key));
      return {
        idx: parseInt(key),
        nickname: user.nickname,
      };
    });

    const onlineUserList = await Promise.all(onlineUserListPromises);

    this.server.emit('onlineUsers', onlineUserList);
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth.token;
    const userData = await this.authService.parsingJwtData(token);
    const userIdx = userData.user_idx;
    onlineUsers[userIdx] = socket;
    try {
      await this.userService.updateStatus(userIdx, UserStatus.ONLINE);
    } catch (error) {
      this.logger.error(`${userIdx}의 offline 업데이트 실패`);
    }
    this.logger.log('connected : ' + socket.id + ' in appGateway ' + userIdx);
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

    const onlineUserListPromises = Object.keys(onlineUsers).map(async (key) => {
      const user = await this.userService.findByIdx(parseInt(key));
      return {
        idx: parseInt(key),
        nickname: user.nickname,
      };
    });

    const onlineUserList = await Promise.all(onlineUserListPromises);

    this.server.emit('onlineUsers', onlineUserList);
  }

  // 챌린지 도전자 신청
  @SubscribeMessage('checkEnableChallengeGame')
  async checkEnableChallengeGame(
    @MessageBody() body: { requestedIdx: number; gameMode: 'normal' | 'hard' },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const userIdx = await this.getUserIdx(socket);

      try {
        const requesterBlockList =
          await this.blockService.getBlockedList(userIdx);
        if (requesterBlockList.includes(body.requestedIdx)) {
          throw new BadRequestException('차단된 사용자입니다.');
        }
        const requestedBlockList = await this.blockService.getBlockedList(
          body.requestedIdx,
        );
        if (requestedBlockList.includes(userIdx)) {
          throw new BadRequestException('차단된 사용자입니다.');
        }
      } catch (error) {
        this.logger.error(error.message);
        socket.emit('checkEnableChallengeGameSuccess', {
          status: 'OFFLINE',
          success: false,
          block: true,
        });
        return;
      }

      const requester = await this.userService.getIsInclueGame(userIdx);
      const requested = await this.userService.getIsInclueGame(
        body.requestedIdx,
      );
      if (requester.include || requested.include) {
        socket.emit('checkEnableChallengeGameSuccess', {
          status: 'OFFLINE',
          success: false,
          block: false,
        });
        return;
      }

      if (requested.status === UserStatus.ONLINE) {
        socket.emit('checkEnableChallengeGameSuccess', {
          status: 'ONLINE',
          success: true,
          block: false,
        });
        const nickname = await this.userService.getNickname(userIdx);
        this.server
          .to(onlineUsers[body.requestedIdx].id)
          .emit('requestedChallenge', {
            nickname,
            requesterIdx: userIdx,
            gameMode: body.gameMode,
          });
      } else if (
        requested.status === UserStatus.OFFLINE ||
        requested.status === UserStatus.PLAYING
      ) {
        socket.emit('checkEnableChallengeGameSuccess', {
          status: requested.status,
          success: false,
          block: false,
        });
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @SubscribeMessage('cancelChallengeGame')
  async cancelChallengeGame(@MessageBody() body: { requestedIdx: number }) {
    if (onlineUsers[body.requestedIdx])
      onlineUsers[body.requestedIdx].emit('cancelChallengeGame');
  }

  async getUserIdx(socket: Socket): Promise<number> {
    const token = socket.handshake.auth.token;
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

  @SubscribeMessage('friendRequest')
  async friendRequest(
    @MessageBody() receiverIdx: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const senderIdx = socket.data.userIdx;
    const sender = await this.userService.findByIdx(senderIdx);
    if (!sender) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    const receiver = await this.userService.findByIdx(receiverIdx);
    if (!receiver) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    try {
      await this.friendService.requestFriend(senderIdx, receiverIdx);

      const alarmDto = AlarmDto.convertDto(
        senderIdx,
        `${sender.nickname}님이 친구 요청을 보냈습니다.`,
        AlarmType.FREIND_REQUEST,
      );

      const alarm = await this.alarmService.createAlarm(receiverIdx, alarmDto);

      alarmDto.idx = alarm.idx;

      if (onlineUsers[receiverIdx].id) {
        this.server
          .to(onlineUsers[receiverIdx].id)
          .emit('notification', alarmDto);
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @SubscribeMessage('acceptFriendRequest')
  async acceptFriendRequest(
    @MessageBody() notificationIdx: number,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const requestedIdx = socket.data.userIdx;
      const notification = await this.alarmService.findByIdx(notificationIdx);
      if (!notification) {
        throw new NotFoundException('존재하지 않는 알림입니다.');
      }
      const requested = await this.userService.findByIdx(requestedIdx);
      if (!requested) {
        throw new NotFoundException('존재하지 않는 유저입니다.');
      }
      await this.friendService.allowFriendRequest(
        notification.sender_idx,
        requestedIdx,
      );

      const alarmDto = AlarmDto.convertDto(
        requestedIdx,
        `${requested.nickname}님이 친구 요청을 수락했습니다.`,
        AlarmType.GENERAL,
      );

      const alarm = await this.alarmService.createAlarm(
        notification.sender_idx,
        alarmDto,
      );
      alarmDto.idx = alarm.idx;

      if (onlineUsers[notification.sender_idx].id) {
        this.server
          .to(onlineUsers[notification.sender_idx].id)
          .emit('notification', alarmDto);
      }

      await this.alarmService.deleteAlarm(notificationIdx);

      const alarms = await this.alarmService.getAlarms(requestedIdx);
      const alarmDtos = alarms.map((alarm) => {
        AlarmDto.fromEntity(alarm);
      });

      if (onlineUsers[requestedIdx].id) {
        this.server
          .to(onlineUsers[requestedIdx].id)
          .emit('notificationList', alarmDtos);
      }

      const requestedFriendList =
        await this.friendService.getFriendList(requestedIdx);
      const requestedFriendDtos = requestedFriendList.map((friend) => {
        return {
          idx: friend.idx,
          nickname: friend.nickname,
          profileImage: friend.avatar.image_data,
        };
      });

      const senderFriendList = await this.friendService.getFriendList(
        notification.sender_idx,
      );
      const senderFriendDtos = senderFriendList.map((friend) => {
        return {
          idx: friend.idx,
          nickname: friend.nickname,
          profileImage: friend.avatar.image_data,
        };
      });

      if (onlineUsers[requestedIdx].id) {
        this.server
          .to(onlineUsers[requestedIdx].id)
          .emit('updateFriendList', requestedFriendDtos);

        this.server
          .to(onlineUsers[requestedIdx].id)
          .emit('receiveFriendUsers', requestedFriendDtos);
      }
      if (onlineUsers[notification.sender_idx].id) {
        this.server
          .to(onlineUsers[notification.sender_idx].id)
          .emit('updateFriendList', senderFriendDtos);

        this.server
          .to(onlineUsers[notification.sender_idx].id)
          .emit('receiveFriendUsers', senderFriendDtos);
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @SubscribeMessage('declineFriendRequest')
  async declineFriendRequest(
    @MessageBody() notificationIdx: number,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const requestedIdx = socket.data.userIdx;
      const notification = await this.alarmService.findByIdx(notificationIdx);
      if (!notification) {
        throw new NotFoundException('존재하지 않는 알림입니다.');
      }
      const requested = await this.userService.findByIdx(requestedIdx);
      if (!requested) {
        throw new NotFoundException('존재하지 않는 유저입니다.');
      }

      await this.alarmService.deleteAlarm(notificationIdx);

      const alarms = await this.alarmService.getAlarms(requestedIdx);
      const alarmDtos = alarms.map((alarm) => {
        AlarmDto.fromEntity(alarm);
      });

      if (onlineUsers[requestedIdx].id) {
        this.server
          .to(onlineUsers[requestedIdx].id)
          .emit('notificationList', alarmDtos);
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @SubscribeMessage('deleteFriend')
  async deleteFriend(@MessageBody() body, @ConnectedSocket() socket: Socket) {
    const userIdx = socket.data.userIdx;
    const friendIdx = body.managedIdx;

    try {
      await this.friendService.deleteFriend(userIdx, friendIdx);
    } catch (error) {
      this.logger.error(error.message);
    }

    const friendList = await this.friendService.getFriendList(userIdx);
    const friendDtos = friendList.map((friend) => {
      return {
        idx: friend.idx,
        nickname: friend.nickname,
        profileImage: friend.avatar.image_data,
      };
    });

    if (onlineUsers[userIdx].id) {
      this.server
        .to(onlineUsers[userIdx].id)
        .emit('updateFriendList', friendDtos);

      this.server
        .to(onlineUsers[userIdx].id)
        .emit('receiveFriendUsers', friendDtos);
    }
    if (onlineUsers[friendIdx].id) {
      this.server
        .to(onlineUsers[friendIdx].id)
        .emit('updateFriendList', friendDtos);

      this.server
        .to(onlineUsers[friendIdx].id)
        .emit('receiveFriendUsers', friendDtos);
    }
  }

  @SubscribeMessage('dmNotification')
  async dmNotification(
    @MessageBody() idx: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (idx === undefined) throw new BadRequestException('idx가 없습니다.');
    const room_id = parseInt(idx);
    const chat = await this.chatService.getChatByIdx(room_id);
    if (!chat) {
      throw new NotFoundException('존재하지 않는 채팅방입니다.');
    }
    if (chat.type !== 'DM') {
      throw new NotFoundException('DM 채팅방이 아닙니다.');
    }

    const senderIdx = socket.data.userIdx;
    const sender = await this.userService.findByIdx(senderIdx);
    if (!sender) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    const participants =
      await this.chatParticipantService.getChatParticipants(room_id);

    const receiver = participants.filter(
      (participant) => participant.user.idx !== senderIdx,
    );
    if (receiver.length === 0) {
      throw new NotFoundException('DM 채팅방에 참여한 유저가 없습니다.');
    }
    const receiverIdx = receiver[0].user.idx;
    if (!receiverIdx) {
      throw new NotFoundException('존재하지 않는 유저입니다.');
    }

    try {
      const alarmDto = AlarmDto.convertDto(
        senderIdx,
        `${sender.nickname}님이 DM을 보냈습니다.`,
        AlarmType.DM,
      );
      alarmDto.room_idx = room_id;

      const alarm = await this.alarmService.createAlarm(receiverIdx, alarmDto);

      alarmDto.idx = alarm.idx;

      if (onlineUsers[receiverIdx].id) {
        this.server
          .to(onlineUsers[receiverIdx].id)
          .emit('notification', alarmDto);
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @SubscribeMessage('generalNotification')
  async generalNotification(
    @MessageBody() idx: number,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const userIdx = socket.data.userIdx;
      const user = await this.userService.findByIdx(userIdx);
      if (!user) {
        throw new NotFoundException('존재하지 않는 유저입니다.');
      }

      await this.alarmService.deleteAlarm(idx);

      const alarms = await this.alarmService.getAlarms(userIdx);
      const alarmDtos = alarms.map((alarm) => {
        AlarmDto.fromEntity(alarm);
      });

      if (onlineUsers[userIdx].id) {
        this.server
          .to(onlineUsers[userIdx].id)
          .emit('notificationList', alarmDtos);
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @SubscribeMessage('block')
  async block(@MessageBody() body, @ConnectedSocket() socket: Socket) {
    const blockerIdx = socket.data.userIdx;
    const blockedIdx = body.managedIdx;

    try {
      await this.blockService.blockUser(blockerIdx, blockedIdx);

      const friendList = await this.friendService.getFriendList(blockerIdx);
      const isFriend = friendList.some(
        (friend) => friend.idx === parseInt(blockedIdx),
      );
      this.logger.error(isFriend);
      if (isFriend) {
        await this.friendService.deleteFriend(blockerIdx, blockedIdx);
      }

      if (onlineUsers[blockerIdx].id) {
        const blockerFriendList =
          await this.friendService.getFriendList(blockerIdx);
        const blockerFriendDtos = blockerFriendList.map((friend) => {
          return {
            idx: friend.idx,
            nickname: friend.nickname,
            profileImage: friend.avatar.image_data,
          };
        });
        this.server
          .to(onlineUsers[blockerIdx].id)
          .emit('updateFriendList', blockerFriendDtos);
      }

      if (onlineUsers[blockedIdx].id) {
        const blockedFriendList =
          await this.friendService.getFriendList(blockedIdx);
        const blockedFriendDtos = blockedFriendList.map((friend) => {
          return {
            idx: friend.idx,
            nickname: friend.nickname,
            profileImage: friend.avatar.image_data,
          };
        });
        this.server
          .to(onlineUsers[blockedIdx].id)
          .emit('updateFriendList', blockedFriendDtos);
      }
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  @SubscribeMessage('unblock')
  async unblock(@MessageBody() body, @ConnectedSocket() socket: Socket) {
    // const chatIdx = parseInt(body.chatIdx);
    // const room = `room-${chatIdx}`;
    const blockerIdx = socket.data.userIdx;
    const blockedIdx = body.managedIdx;

    try {
      await this.blockService.unBlockUser(blockerIdx, blockedIdx);
    } catch (error) {
      this.logger.error(error.message);
    }

    const blockedUsers = await this.blockService.getBlockList(blockerIdx);

    this.server.emit('receiveblockedUsers', blockedUsers);
  }
}
