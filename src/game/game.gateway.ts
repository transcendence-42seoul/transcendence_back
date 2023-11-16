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
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join.room.dto';
import { KyeEvent, KyeEventDto } from './dto/key.event.dto';
import { CGame, DIRECTION } from './game.engine';

type GameStoreType = {
  [key: string]: CGame;
};

const GameStore: GameStoreType = {};

@WebSocketGateway({ namespace: 'games' })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly gameService: GameService) {}
  private logger = new Logger('games');
  private server = new Server();

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log('disconnected : ' + socket.id);
    if ([...socket.rooms.values()].length < 2) return;
    const roomId = [...socket.rooms.values()][1];
    if (roomId === undefined) return;
    this.gameService.leaveGameRoom(socket, roomId);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    this.logger.log('connected : ' + socket.id);
  }

  afterInit() {
    this.logger.log('init');
  }

  @SubscribeMessage('joinGame')
  joinGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGameRoom(socket, body.room_id);
    this.logger.log(socket.id + ' join in ' + body.room_id);
  }

  @SubscribeMessage('joinTestGame')
  joinTestGame(
    @MessageBody() body: JoinRoomDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.gameService.joinGameRoom(socket, 'testRoom');
    this.logger.log(socket.id + ' join in ' + body.room_id);
  }

  //update + 정상적인 game over
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
    console.log([...socket.rooms.values()]);
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
   * 기준 room id를 받는 조건과 아닌 조건... 이 있나...?
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
