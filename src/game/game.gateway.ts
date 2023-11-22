import { AuthService } from 'src/auth/auth.service';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { GameService } from './game.service';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join.room.dto';
import { KyeEvent, KyeEventDto } from './dto/key.event.dto';
import { CGame, DIRECTION } from './game.engine';
import { GameMode, GameModeType } from './entities/game.entity';
import { UserRepository } from 'src/user/user.repository';

// import { GameModeType, GameMode } from './entities/game.entity';

type GameStoreType = {
  [key: string]: CGame;
};

const GameStore: GameStoreType = {};

const NormalWaitingQueue = [];
const HardWaitingQueue = [];

interface LadderWaitingQueueType {
  mode: 'normal' | 'hard';
  token: string;
}

@WebSocketGateway({ namespace: 'gameGateway' })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly gameService: GameService,
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository,
  ) {}
  private logger = new Logger('games');
  private server = new Server();

  clearSocketInAllQueue(socket: Socket) {
    const normalIndex = NormalWaitingQueue.findIndex((element) => {
      return element[0] === socket;
    });
    if (normalIndex > -1) {
      NormalWaitingQueue.splice(normalIndex, 1);
    }
    const hardIndex = HardWaitingQueue.findIndex((element) => {
      return element[0] === socket;
    });
    if (hardIndex > -1) {
      HardWaitingQueue.splice(hardIndex, 1);
    }
  }

  // 1. queue에서 다 나가야함. []
  // 2. room에서 다 나가야함. []
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('disconnected : ' + socket.id);
    if ([...socket.rooms.values()].length < 2) return;
    const roomId = [...socket.rooms.values()][1];
    if (roomId === undefined) return;
    this.gameService.leaveGameRoom(socket, roomId);
    this.clearSocketInAllQueue(socket);
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.query.token;
    let temp;
    try {
      // token 유효성 검사
      const data = this.authService.parsingJwtData(token as string);

      temp = data;
      if (!data) {
        throw new UnauthorizedException('Unauthorized access');
      }
    } catch (error) {
      socket.emit('error', error.message);
      socket.disconnect();
    }

    try {
      const game = await this.gameService.getUserGame(temp.user_idx);
      if (game) {
        socket.join(game.room_id);
      }
      if (game) this.logger.log('connected : ' + socket.id);
    } catch (error) {
      console.log(error);
    }
  }

  afterInit() {
    this.logger.log('init');
  }

  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinLadderQueue')
  async joinLadderQueue(
    @MessageBody() body: LadderWaitingQueueType,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const data = this.authService.parsingJwtData(body.token);
      if (!data) {
        throw new UnauthorizedException('Unauthorized access');
      }
      if (body.mode === 'normal') {
        NormalWaitingQueue.push([socket, data.user_idx]);
        if (NormalWaitingQueue.length >= 2) {
          await this.createMatch(
            GameMode.LADDER_NORMAL,
            {
              socket: NormalWaitingQueue[0][0],
              idx: NormalWaitingQueue[0][1],
            },
            {
              socket: NormalWaitingQueue[1][0],
              idx: NormalWaitingQueue[1][1],
            },
          );
          NormalWaitingQueue.splice(0, 2);
        }
      } else if (body.mode === 'hard') {
        HardWaitingQueue.push([socket, data.user_idx]);
        if (HardWaitingQueue.length >= 2) {
          this.createMatch(
            GameMode.LADDER_HARD,
            {
              socket: HardWaitingQueue[0][0],
              idx: HardWaitingQueue[0][1],
            },
            {
              socket: HardWaitingQueue[1][0],
              idx: HardWaitingQueue[1][1],
            },
          );
          HardWaitingQueue.splice(0, 2);
        }
      }
      this.logger.log(socket.id + ' join in ' + body.mode + 'ladder queue');
    } catch (error) {
      socket.emit('error', error.message);
    }
  }
  @SubscribeMessage('cancelLadderQueue')
  cancelLadderQueue(
    @MessageBody() body: LadderWaitingQueueType,
    @ConnectedSocket() socket: Socket,
  ) {
    if (body.mode === 'normal') {
      const index = NormalWaitingQueue.findIndex((element) => {
        return element[0] === socket;
      });
      if (index > -1) {
        NormalWaitingQueue.splice(index, 1);
      }
    } else if (body.mode === 'hard') {
      const index = HardWaitingQueue.findIndex((element) => {
        return element[0] === socket;
      });
      if (index > -1) {
        HardWaitingQueue.splice(index, 1);
      }
    }
    this.logger.log(socket.id + ' cancel waiting ladder queue ');
  }

  async createMatch(
    gameMode: GameModeType,
    hostData: {
      socket: Socket;
      idx: number;
    },
    guestData: {
      socket: Socket;
      idx: number;
    },
  ) {
    try {
      if (
        hostData === undefined ||
        guestData === undefined ||
        hostData.idx === guestData.idx
      ) {
        throw new UnauthorizedException('Unauthorized access');
      }
      const game = await this.gameService.createGame({
        game_mode: gameMode,
        gameHost: hostData.idx,
        gameGuest: guestData.idx,
      });
      hostData.socket.emit('createGameSuccess', game);
      guestData.socket.emit('createGameSuccess', game);
      hostData.socket.join(game.room_id);
      guestData.socket.join(game.room_id);
      this.logger.log(
        `create game ${hostData.idx}, ${guestData.idx}} in ${game.room_id}`,
      );
    } catch (error) {
      throw Error("can't create game");
    }
  }

  acceptChallengeMatch(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGameRoom(socket, body.room_id);
    this.logger.log(socket.id + ' join in ' + body.room_id);
  }

  @SubscribeMessage('joinGame')
  joinGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGameRoom(socket, body.room_id);
    this.logger.log(socket.id + ' join in ' + body.room_id);
  }

  updateGame(roomId: string, socket: Socket) {
    GameStore[roomId].update();
    if (GameStore[roomId].over === true) {
      socket.emit('endGame');
      socket.to(roomId).emit('endGame');
      if (GameStore[roomId].intervalId) {
        clearInterval(GameStore[roomId].intervalId);
        GameStore[roomId].intervalId = null;
      }
    }
    socket.emit('getGameData', GameStore[roomId].getGameData());
    socket.to(roomId).emit('getGameData', GameStore[roomId].getGameData());
  }

  @SubscribeMessage('startGame')
  startGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    if ([...socket.rooms.values()].length < 2) {
      return;
    }

    const roomId = [...socket.rooms.values()][1];
    if (roomId === undefined) {
      this.logger.log('roomId is undefined');
      return;
    }
    if (roomId in GameStore) {
      return;
    }
    this.logger.log(`${roomId} game start!`);
    GameStore[roomId] = new CGame();
    socket.emit('gameData', GameStore[roomId]);
    socket.to(roomId).emit('gameData', GameStore[roomId]);

    GameStore[roomId].intervalId = setInterval(
      () => this.updateGame(roomId, socket),
      1000 / 60,
    );
  }

  @SubscribeMessage('keyEvent')
  keyEvent(@MessageBody() body: KyeEventDto) {
    const roomId = body.room_id;
    const cur_key: KyeEvent = body.key;
    let direction;
    if (cur_key == 'keyUp') direction = DIRECTION.UP;
    else if (cur_key == 'keyDown') direction = DIRECTION.DOWN;
    else if (cur_key == 'keyIdle') direction = DIRECTION.IDLE;

    if (body.identity === 'Host') GameStore[roomId].setHostMove(direction);
    else if (body.identity === 'Guest')
      GameStore[roomId].setGuestMove(direction);
  }

  /**
   * 기준 room id를 받는 조건과 아닌 조건... 이 있나ss...?
   */

  @SubscribeMessage('endGame')
  endGame(@MessageBody() body: JoinRoomDto) {
    clearInterval(GameStore[body.room_id].intervalId);
    this.deleteGame(body.room_id);
    this.logger.log('game end in ' + body.room_id);
  }

  deleteGame(room_id: string) {
    delete GameStore[room_id];
  }

  @SubscribeMessage('new_chat') // 해당하는 이벤트를 찾는다. 이 이벤트 이름은 프론트엔드에서 보내주는 이벤트 이름과 같아야한다.
  handleChat(
    @MessageBody() chat: string,
    @ConnectedSocket() socket: Socket, // 이 소켓으로 서버는 emit, on을 할 수 있다.
  ) {
    if ([...socket.rooms.values()].length < 2) return;
    const roomId = [...socket.rooms.values()][1];
    if (roomId === undefined) return;
    this.logger.log('new_chat : ' + chat + ' in ' + roomId);
    socket.broadcast.to(roomId).emit('receiveMessage', chat); // 자신을 제외한 모든 소켓에게 메시지를 보낸다. (자신에게는 보내지 않는다.)
  }
}
