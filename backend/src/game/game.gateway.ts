import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';

export interface socketsValues {
  socketId: string;
  playerId: string;
}

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private gameService: GameService,
    private authService: AuthService,
  ) {}

  private biMap: BiMapUserSocket = new BiMapUserSocket();

  handleConnection(socket: Socket): void {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket): void {
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('join-game')
  async handleJoin(
    socket: Socket,
    data: { token: string; code: string; name: string },
  ): Promise<void> {
    const { token, code, name } = data;
    const user = await this.authService.validateToken(token);
    if (!user) {
      return;
    }
    const userId = user.id;

    this.gameService.createGame(code);
    if (this.biMap.hasUser(userId)) {
      this.biMap.setSocketFromUser(userId, socket.id);
      if (this.biMap.hasGameFromUser(userId, code)) {
        this.gameService.setOnline(code, userId);
      } else {
        this.biMap.addGameFromUser(userId, code);
        this.gameService.addPlayer(code, userId, name);
      }
    } else {
      this.biMap.set(userId, socket.id, code);
      this.gameService.addPlayer(code, userId, name);
    }
    socket.join(code);

    this.emitGameState(code);
  }

  @SubscribeMessage('start-game')
  handleStartGame(socket: Socket, data: { code: string }): void {
    const { code } = data;

    this.gameService.startGame(code);

    this.emitGameState(code);
  }

  @SubscribeMessage('reveal-card')
  handleReveal(socket: Socket, data: { code: string; cardId: string }): void {
    const { code, cardId } = data;
    const playerId = this.biMap.getFromSocket(socket.id);
    if (
      !this.gameService.isPlayerTurn(code, playerId) ||
      !this.gameService.isOpponentCard(code, playerId, cardId) ||
      this.gameService.isEndOfRound(code)
    )
      return;

    const isEndOfRound = this.gameService.handleReveal(code, cardId);

    this.emitGameState(code);

    if (isEndOfRound) {
      setTimeout(() => {
        this.gameService.handleEndOfRound(code);
        this.emitGameState(code);
      }, 2000);
    }
  }

  async emitGameState(code: string): Promise<void> {
    const sockets = await this.server.in(code).fetchSockets();
    sockets.forEach((socket) => {
      socket.emit(
        'game-updated',
        this.gameService.getVisibleStateFor(
          code,
          this.biMap.getFromSocket(socket.id),
        ),
      );
    });
  }
}
