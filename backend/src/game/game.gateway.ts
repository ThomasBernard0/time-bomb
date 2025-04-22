import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameState } from './game.state';
import { GameService } from './game.service';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private gameService: GameService,
    private authService: AuthService,
  ) {}

  private games: Map<string, GameState> = new Map();
  private socketToPlayer: Map<string, { code: string; playerId: string }> =
    new Map();

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.socketToPlayer.delete(socket.id);
  }

  @SubscribeMessage('join-game')
  async handleJoin(socket: Socket, data: { token: string; code: string }) {
    const { token, code } = data;
    const user = await this.authService.validateToken(token);
    if (!user) {
      return;
    }
    let player = await this.gameService.getPlayerByUserIdAndCode(code, user.id);
    let game = this.games.get(code);
    if (!game) {
      game = new GameState(code);
      this.games.set(code, game);
    }
    game.addPlayer({ id: player.id, name: player.name });
    this.socketToPlayer.set(socket.id, {
      code: code,
      playerId: player.id,
    });
    socket.join(code);
    this.emitGameState(game);
  }

  @SubscribeMessage('start-game')
  handleStartGame(socket: Socket, data: { gameCode: string }) {
    const context = this.socketToPlayer.get(socket.id);
    if (!context) return;

    const game = this.games.get(context.code);
    if (!game) return;

    const { gameCode } = data;
    this.gameService.startGame(gameCode);
    this.emitGameState(game);
  }

  @SubscribeMessage('reveal-card')
  handleReveal(socket: Socket, payload: { cardId: string }) {
    const context = this.socketToPlayer.get(socket.id);
    if (!context) return;

    const game = this.games.get(context.code);
    if (!game) return;

    game.revealCard(payload.cardId);
    this.emitGameState(game);
  }

  private emitGameState(game: GameState) {
    for (const [
      socketId,
      { code, playerId },
    ] of this.socketToPlayer.entries()) {
      if (game.code === code) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('game-updated', game.getVisibleStateFor(playerId));
        }
      }
    }
  }
}
