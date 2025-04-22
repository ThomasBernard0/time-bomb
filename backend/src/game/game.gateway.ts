import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameService } from './game.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  private logger: Logger = new Logger('GameGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { gameCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { gameCode } = data;
    client.join(gameCode);
    client.data.gameCode = gameCode;
    this.emitPlayersUpdate(gameCode);
  }

  async emitPlayersUpdate(gameCode: string) {
    const players = await this.gameService.getPlayersInGame(gameCode);
    this.server.to(gameCode).emit('players-update', players);
  }
}
