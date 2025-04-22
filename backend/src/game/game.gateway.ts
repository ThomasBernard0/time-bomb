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

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private gameService: GameService) {}

  private games: Map<string, GameState> = new Map();
  private socketToPlayer: Map<string, { gameId: string; playerId: string }> =
    new Map();

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
    this.socketToPlayer.delete(socket.id);
  }

  @SubscribeMessage('join-game')
  handleJoin(
    socket: Socket,
    payload: { gameId: string; playerId: string; playerName: string },
  ) {
    let game = this.games.get(payload.gameId);
    if (!game) {
      game = new GameState(payload.gameId);
      this.games.set(payload.gameId, game);
    }

    game.addPlayer({ id: payload.playerId, name: payload.playerName });
    this.socketToPlayer.set(socket.id, {
      gameId: payload.gameId,
      playerId: payload.playerId,
    });
    socket.join(payload.gameId);
    this.emitGameState(game);
  }

  @SubscribeMessage('start-game')
  handleStartGame(socket: Socket, data: { gameCode: string }) {
    const context = this.socketToPlayer.get(socket.id);
    if (!context) return;

    const game = this.games.get(context.gameId);
    if (!game) return;

    const { gameCode } = data;
    this.gameService.startGame(gameCode);
    this.emitGameState(game);
  }

  @SubscribeMessage('reveal-card')
  handleReveal(socket: Socket, payload: { cardId: string }) {
    const context = this.socketToPlayer.get(socket.id);
    if (!context) return;

    const game = this.games.get(context.gameId);
    if (!game) return;

    game.revealCard(payload.cardId);
    this.emitGameState(game);
  }

  private emitGameState(game: GameState) {
    for (const [
      socketId,
      { gameId, playerId },
    ] of this.socketToPlayer.entries()) {
      if (game.gameId === gameId) {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('game-updated', game.getVisibleStateFor(playerId));
        }
      }
    }
  }
}
