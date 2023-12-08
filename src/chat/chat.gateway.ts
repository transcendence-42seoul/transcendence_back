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
import { UserManagementDto } from './dto/user.manage.dto';
import { BanService } from './ban/ban.service';
import { onlineUsers } from 'src/app.gateway';
import { Role } from './chat.participant.entity';
import { appGateway } from 'src/app.gateway';
import { BlockService } from 'src/block/block.service';

interface IChat {
  idx: number;
  content: string;
  send_at: Date;
  room_idx: number;
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
    private readonly blockService: BlockService,
    private readonly kickService: KickService,
    private readonly banService: BanService,
    private readonly muteService: MuteService,
    private readonly AppGateway: appGateway,
  ) {}
  private logger = new Logger('chats'); // 테스트용 다쓰면 지워도 됨.

  chatUsers: {
    [key: string]: number;
  } = {};

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('disconnected : ' + socket.id);

    delete this.chatUsers[socket.id];
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.auth.token;
    const userData = await this.authService.parsingJwtData(token);
    const userIdx = userData.user_idx;

    this.chatUsers[socket.id] = userIdx;

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
    this.logger.log('connected : ' + socket.id + ' ' + userIdx);
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
      this.AppGateway.server.emit('chatRoomCreated', chat);
      return { status: 'success', chatIdx: chat.idx };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('updateChat')
  async updateChat(@MessageBody() body: UpdateChatDto) {
    const chatIdx = body.chatIdx;
    const password = body.password;

    try {
      const chat = await this.chatService.updateChat(chatIdx, password);
      this.AppGateway.server.emit('chatRoomUpdated', chat);
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

      // 룸에 넣어줌
      this.chatService.joinChatRoom(socket, room);
      this.server
        .to(room)
        .emit('receiveChatParticipants', filteredParticipants);

      return { status: 'success' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() chatMessageDto: ChatMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const message = chatMessageDto.message;
    const userIdx = socket.data.userIdx;

    try {
      const chatMessage: ChatMessage =
        await this.chatMessageService.createChatMessage(
          chatMessageDto.room_id,
          socket.data.userIdx,
          message,
        );

      const user = await this.userService.findByIdx(userIdx);

      const makeIChat: IChat = {
        idx: chatMessage.idx,
        content: chatMessage.content,
        room_idx: chatMessage.chat.idx,
        send_at: chatMessage.send_at,
        user: {
          idx: chatMessage.user.idx,
          nickname: user.nickname,
        },
      };

      const keys = Object.keys(this.chatUsers);
      for (const socketId of keys) {
        const eachUserIdx = this.chatUsers[socketId];
        const cantSend = await this.chatMessageService.checkChatMessage(
          eachUserIdx,
          chatMessage,
        );
        if (!cantSend) continue;
        this.server.to(socketId).emit('receiveMessage', makeIChat);
      }
    } catch (error) {
      if (
        error.message ===
        `User with idx "${userIdx}" is muted in chat "${chatMessageDto.room_id}"`
      ) {
        socket.emit('showMuteError', {
          message: error.message,
        });
      } else {
        socket.emit('showError', {
          message: error.message,
        });
      }
    }
  }

  async receiveChatParticipants(chatIdx: number) {
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

    return filteredParticipants;
  }

  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @MessageBody() room_id: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const chatIdx = room_id;
    const room = `room-${chatIdx}`;
    const userIdx = socket.data.userIdx;

    try {
      await this.chatParticipantService.leaveChat(userIdx, chatIdx);
      const chat = await this.chatService.getChatByIdx(chatIdx);
      this.AppGateway.server.emit('chatRoomUpdate', chat);

      const owner = await this.chatParticipantService.getChatOwner(chatIdx);
      if (!owner) {
        const keys = Object.keys(this.chatUsers);
        for (const socketId of keys) {
          const eachUserIdx = this.chatUsers[socketId];
          if (eachUserIdx !== userIdx) {
            console.log('->', eachUserIdx, socketId);
            this.server.to(socketId).emit('ownerLeaveChat', chatIdx);
          }
        }
        //
        this.AppGateway.server.emit('chatRoomDeleted', chatIdx);
        await this.chatService.deleteChat(chatIdx);
      }

      const filteredParticipants = await this.receiveChatParticipants(chatIdx);

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
    const room = `room-${body.chatIdx}`;
    const chatIdx = parseInt(body.chatIdx);
    const kickedIdx = body.managedIdx;
    const kickerIdx = socket.data.userIdx;

    try {
      await this.kickService.kickParticipant(chatIdx, kickerIdx, kickedIdx);
      const kickedSocketId = onlineUsers[kickedIdx].id;
      this.AppGateway.server.to(kickedSocketId).emit('kicked', chatIdx);

      const filteredParticipants = await this.receiveChatParticipants(chatIdx);

      this.server
        .to(room)
        .emit('receiveChatParticipants', filteredParticipants);
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
    const room = `room-${body.chatIdx}`;
    const chatIdx = parseInt(body.chatIdx);
    const bannedIdx = body.managedIdx;
    const bannerIdx = socket.data.userIdx;

    try {
      await this.banService.banUser(chatIdx, bannerIdx, bannedIdx);
      const bannedSocketId = onlineUsers[bannedIdx].id;
      this.AppGateway.server.to(bannedSocketId).emit('banned', chatIdx);

      const filteredParticipants = await this.receiveChatParticipants(chatIdx);

      this.server
        .to(room)
        .emit('receiveChatParticipants', filteredParticipants);
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

    try {
      await this.muteService.muteUser(chatIdx, muterIdx, mutedIdx);
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
      Logger.error(error.message);
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

  // @SubscribeMessage('blockChatMember')
  // async BlockChatMember(
  //   @ConnectedSocket() socket: Socket,
  //   @MessageBody() body: UserManagementDto,
  // ) {
  //   const chatIdx = parseInt(body.chatIdx);
  //   const room = `room-${chatIdx}`;
  //   const blockedIdx = body.managedIdx;
  //   const blockerIdx = socket.data.userIdx;

  //   try {
  //     const owners = await this.chatParticipantService.getChatOwner(chatIdx);

  //     if (owners[0].user.idx === blockerIdx) {
  //       await this.chatParticipantService.leaveChat(blockedIdx, chatIdx);
  //       const participants =
  //         await this.chatParticipantService.getChatParticipants(chatIdx);

  //       const filteredParticipants = participants.map((participant) => ({
  //         idx: participant.idx,
  //         role: participant.role,
  //         user: {
  //           idx: participant.user.idx,
  //           nickname: participant.user.nickname,
  //         },
  //       }));

  //       this.server
  //         .to(room)
  //         .emit('receiveChatParticipants', filteredParticipants);

  //       const blockedSockedId = onlineUsers[blockedIdx].id;

  //       this.AppGateway.server.to(blockedSockedId).emit('banned', chatIdx);
  //     }

  //     return { status: 'success' };
  //   } catch (error) {
  //     return { status: 'error', message: error.message };
  //   }
  // }
}
