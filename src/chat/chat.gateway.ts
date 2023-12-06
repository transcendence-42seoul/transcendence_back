import { Logger } from '@nestjs/common';
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
import { ChatService } from './chat.service';
import { Socket } from 'socket.io';
import { JoinChatDto } from './dto/join.chat.dto';
import { ChatParticipantService } from './chat.participant.service';
import { ChatMessageService } from './chat.message.service';
import { ChatType } from './chat.entity';
import { ChatMessageDto } from './dto/chat.message.dto';
import { AuthService } from 'src/auth/auth.service';
import CreateChatDto from './dto/chat.create.dto';
import { ChatMessage } from './chat.message.entity';
import { Server } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { KickService } from './kick/kick.service';
import UpdateChatDto from './dto/chat.update.dto';
import { MuteService } from './mute/mute.service';
import { appGateway } from 'src/app.gateway';
import { UserManagementDto } from './dto/user.manage.dto';
import { BanService } from './ban/ban.service';
import { onlineUsers } from 'src/app.gateway';
import { Role } from './chat.participant.entity';

interface IChat {
  idx: number;
  content: string;
  send_at: Date;
  user: {
    idx: number;
    nickname: string;
  };
}

@WebSocketGateway({ namespace: 'chats' })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly chatParticipantService: ChatParticipantService,
    private readonly chatMessageService: ChatMessageService,
    private readonly kickService: KickService,
    private readonly banService: BanService,
    private readonly muteService: MuteService,
    private readonly appGateway: appGateway,
  ) {}
  private logger = new Logger('chats'); // 테스트용 다쓰면 지워도 됨.

  chatUsers: {
    [key: number]: string;
  } = {};

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('disconnected : ' + socket.id);

    const token = socket.handshake.auth.token || socket.handshake.query.token;
    const userData = this.authService.parsingJwtData(token);
    const userIdx = userData.user_idx;
    delete this.chatUsers[userIdx];

    // // 어떤방도 참여하지 않았을 경우
    // if ([...socket.rooms.values()].length < 2) return;

    // // 첫 번째 방은 클라이언트의 소켓 id에 해당하므로, 두 번째 방부터 처리
    // // 클라이언트는 연결 시 자동으로 자신의 소켓 id와 동일한 이름의 방에 참여
    // const rooms = [...socket.rooms.values()].slice(1);
    // for (const roomId of rooms) {
    //   if (roomId === undefined) return;
    //   this.chatService.leaveChatRoom(socket, roomId);
    // }
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected : ' + socket.id);

    const token = socket.handshake.auth.token;
    const userData = await this.authService.parsingJwtData(token);
    const userIdx = userData.user_idx;

    this.chatUsers[userIdx] = socket.id;

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

    let chat;
    try {
      if (password === '') {
        chat = await this.chatService.createPublic(userIdx, name, limit);
      } else {
        chat = await this.chatService.createPrivate(
          userIdx,
          name,
          password,
          limit,
        );
      }
      this.chatService.joinChatRoom(socket, `room-${chat.idx}`);
      this.appGateway.server.emit('chatRoomCreated', chat);
      return { status: 'success', chatIdx: chat.idx };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('updateChat')
  async updateChat(
    @MessageBody() body: UpdateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chatIdx = body.chatIdx;
    const password = body.password;

    console.log('=>', chatIdx, password);

    try {
      const chat = await this.chatService.updateChat(chatIdx, password);
      this.appGateway.server.emit('chatRoomUpdated', chat);
      return { status: 'success', chat: chat };
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
    const room = `room-${chatIdx}`;

    const chat = await this.chatService.getChatByIdx(chatIdx);

    try {
      let participants =
        await this.chatParticipantService.getChatParticipants(chatIdx);
      let isParticipate = false;
      for (const p of participants) {
        if (p.user.idx === userIdx) {
          isParticipate = true;
          break;
        }
      }

      if (!isParticipate) {
        if (chat.type === ChatType.PRIVATE) {
          await this.chatParticipantService.joinPrivateChat(
            userIdx,
            chatIdx,
            password,
          );
        } else if (chat.type === ChatType.PUBLIC) {
          await this.chatParticipantService.joinPublicChat(userIdx, chatIdx);
        }
      }

      participants =
        await this.chatParticipantService.getChatParticipants(chatIdx);

      const filteredParticipants = participants.map((participant) => ({
        idx: participant.idx,
        role: participant.role,
        user: {
          idx: participant.user.idx,
          nickname: participant.user.nickname,
        },
      }));

      console.log(filteredParticipants);

      // 룸에 넣어줌
      this.chatService.joinChatRoom(socket, room);
      this.server
        .to(room)
        .emit('receiveChatParticipants', filteredParticipants);
      console.log('join idx', room);
      return { status: 'success' };
    } catch (error) {
      if (error.message === `User "${userIdx}" are banned in this chat`) {
        const bannedSocketId = onlineUsers[userIdx].id;
        this.appGateway.server.to(bannedSocketId).emit('isBan');
      } else if (error.message === `You are blocked by owner`) {
        const blockedSocketId = onlineUsers[userIdx].id;
        this.appGateway.server.to(blockedSocketId).emit('isBan');
      }
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() chatMessageDto: ChatMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('sendMessage');
    const room = `room-${chatMessageDto.room_id}`;
    const message = chatMessageDto.message;

    // console.log(chatMessageDto.room_id);
    // console.log(socket.data.userIdx);
    // console.log(message);

    try {
      const chatMessage: ChatMessage =
        await this.chatMessageService.createChatMessage(
          chatMessageDto.room_id,
          socket.data.userIdx,
          message,
        );

      const user = await this.userService.findByIdx(socket.data.userIdx);

      const makeIChat: IChat = {
        idx: chatMessage.idx,
        content: chatMessage.content,
        send_at: chatMessage.send_at,
        user: {
          idx: chatMessage.user.idx,
          nickname: user.nickname,
        },
      };

      // console.log(makeIChat);
      this.server.to(room).emit('receiveMessage', makeIChat);
      // socket.emit('receiveMessage', makeIChat);
      // socket.broadcast.to(room).emit('receiveMessage', makeIChat);
    } catch (error) {
      socket.emit('showError', {
        message: error.message,
      });
    }
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @MessageBody() room_id: number,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log('leaveChat');
    const chatIdx = room_id;
    const room = `room-${chatIdx}`;
    const userIdx = socket.data.userIdx;

    try {
      await this.chatParticipantService.leaveChat(userIdx, chatIdx);

      const owner = await this.chatParticipantService.getChatOwner(chatIdx);
      // console.log(owner);
      if (owner.length === 0) {
        console.log('aaaaaa');
        this.server.to(room).emit('ownerLeaveChat', chatIdx);
        this.appGateway.server.emit('chatRoomDeleted', chatIdx);
        await this.chatService.deleteChat(chatIdx);
      }

      const participants =
        await this.chatParticipantService.getChatParticipants(chatIdx);

      const filteredParticipants = participants.map((participant) => ({
        idx: participant.idx,
        role: participant.role,
        user: {
          idx: participant.user.idx,
          nickname: participant.user.nickname,
        },
      }));

      console.log('participant', participants);

      this.server
        .to(room)
        .emit('receiveChatParticipants', filteredParticipants);
      this.chatService.leaveChatRoom(socket, room);
      return { status: 'success' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('kick')
  async handleKick(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: UserManagementDto,
  ) {
    console.log(body);
    const chatIdx = parseInt(body.chatIdx);
    const kickedIdx = body.managedIdx;
    const kickerIdx = socket.data.userIdx;

    try {
      await this.kickService.kickParticipant(chatIdx, kickerIdx, kickedIdx);
      // const kickedSocketId = this.chatUsers[kickedIdx];
      // console.log('chatUsers', this.chatUsers);
      // console.log('kickedSocketId', kickedSocketId);
      // socket.to(kickedSocketId).emit('kicked', chatIdx);
      const kickedSocketId = onlineUsers[kickedIdx].id;
      this.appGateway.server.to(kickedSocketId).emit('kicked', chatIdx);
    } catch (error) {
      socket.emit('showError', {
        message: error.message,
      });
      return;
    }
  }

  @SubscribeMessage('ban')
  async handleBan(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: UserManagementDto,
  ) {
    const chatIdx = parseInt(body.chatIdx);
    const bannedIdx = body.managedIdx;
    const bannerIdx = socket.data.userIdx;
    console.log('ban', chatIdx, bannedIdx, bannerIdx);

    try {
      await this.banService.banUser(chatIdx, bannerIdx, bannedIdx);
      const bannedSocketId = onlineUsers[bannedIdx].id;
      this.appGateway.server.to(bannedSocketId).emit('banned', chatIdx);
    } catch (error) {
      socket.emit('showError', {
        message: error.message,
      });
      return;
    }
  }

  @SubscribeMessage('mute')
  async handleMute(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: UserManagementDto,
  ) {
    const chatIdx = parseInt(body.chatIdx);
    const mutedIdx = body.managedIdx;
    const muterIdx = socket.data.userIdx;
    console.log('mute', chatIdx, mutedIdx, muterIdx);

    try {
      await this.muteService.muteUser(chatIdx, muterIdx, mutedIdx);
      // 전체 소켓 처리
      // muted user의 socket id를 찾아서 mutedIdx를 보내줌
      const targetUser = onlineUsers[mutedIdx].id;
      console.log('targetUser', targetUser);
      //
    } catch (error) {
      socket.emit('showError', {
        message: error.message,
      });
      return;
    }
  }

  @SubscribeMessage('leaveDm')
  async handleLeaveDm(
    @MessageBody() room_id: number,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      this.chatService.leaveChatRoom(socket, `room-${room_id}`);
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('grant')
  async handleGrant(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: UserManagementDto,
  ) {
    const chatIdx = parseInt(body.chatIdx);
    const room = `room-${chatIdx}`;
    const grantedIdx = body.managedIdx;
    console.log('body', body);
    console.log('grant', chatIdx, grantedIdx);

    try {
      await this.chatParticipantService.updateRole(
        grantedIdx,
        chatIdx,
        Role.ADMIN,
      );

      const participants =
        await this.chatParticipantService.getChatParticipants(chatIdx);

      const filteredParticipants = participants.map((participant) => ({
        idx: participant.idx,
        role: participant.role,
        user: {
          idx: participant.user.idx,
          nickname: participant.user.nickname,
        },
      }));

      this.server
        .to(room)
        .emit('receiveChatParticipants', filteredParticipants);

      return { status: 'success' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('revoke')
  async handleRevoke(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: UserManagementDto,
  ) {
    const chatIdx = parseInt(body.chatIdx);
    const room = `room-${chatIdx}`;
    const revokedIdx = body.managedIdx;
    console.log('revoke', chatIdx, revokedIdx);

    try {
      await this.chatParticipantService.updateRole(
        revokedIdx,
        chatIdx,
        Role.USER,
      );

      const participants =
        await this.chatParticipantService.getChatParticipants(chatIdx);

      const filteredParticipants = participants.map((participant) => ({
        idx: participant.idx,
        role: participant.role,
        user: {
          idx: participant.user.idx,
          nickname: participant.user.nickname,
        },
      }));

      this.server
        .to(room)
        .emit('receiveChatParticipants', filteredParticipants);

      return { status: 'success' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('blockChatMember')
  async BlockChatMember(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: UserManagementDto,
  ) {
    const chatIdx = parseInt(body.chatIdx);
    const room = `room-${chatIdx}`;
    const blockedIdx = body.managedIdx;
    console.log('blockChatMember', chatIdx, blockedIdx);

    try {
      await this.chatParticipantService.leaveChat(blockedIdx, chatIdx);

      const participants =
        await this.chatParticipantService.getChatParticipants(chatIdx);

      const filteredParticipants = participants.map((participant) => ({
        idx: participant.idx,
        role: participant.role,
        user: {
          idx: participant.user.idx,
          nickname: participant.user.nickname,
        },
      }));

      this.server
        .to(room)
        .emit('receiveChatParticipants', filteredParticipants);

      const blockedSockedId = onlineUsers[blockedIdx].id;

      this.appGateway.server.to(blockedSockedId).emit('banned', chatIdx);

      return { status: 'success' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
