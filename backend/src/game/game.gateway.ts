import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameState, Player } from './game.state';
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

  private gamesSockets: Map<string, socketsValues[]> = new Map();

  handleConnection(socket: Socket) {
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('join-game')
  async handleJoin(socket: Socket, data: { token: string; code: string }) {
    const { token, code } = data;
    const user = await this.authService.validateToken(token);
    if (!user) {
      return;
    }
    let player = await this.gameService.getPlayerByUserIdAndCode(code, user.id);

    let game = this.gameService.getOrCreateGame(code);

    const playerInState: Player = game.players.find((p) => p.id === player.id);
    if (playerInState) {
      if (playerInState.name !== player.name) {
        playerInState.name = player.name;
      }
    } else {
      game.addPlayer({ id: player.id, name: player.name });
    }

    const existingSockets = this.gamesSockets.get(code) || [];
    const existSocket = existingSockets.some((p) => p.socketId === socket.id);
    if (!existSocket) {
      this.gamesSockets.set(code, [
        ...existingSockets,
        {
          socketId: socket.id,
          playerId: player.id,
        },
      ]);
    }
    socket.join(code);

    this.emitGameState(game, code);
  }

  @SubscribeMessage('start-game')
  handleStartGame(socket: Socket, data: { code: string }) {
    const { code } = data;
    let game = this.gameService.getOrCreateGame(code);
    if (!game) return;
    this.gameService.startGame(code);
    this.emitGameState(game, code);
  }

  @SubscribeMessage('reveal-card')
  handleReveal(socket: Socket, data: { code: string; cardId: string }) {
    const { code, cardId } = data;
    let game = this.gameService.getOrCreateGame(code);
    if (!game) return;
    const playerId = this.gamesSockets
      .get(code)
      .find((p) => p.socketId === socket.id).playerId;
    if (playerId != game.playerTurnId) return;
    game.revealCard(cardId);
    this.emitGameState(game, code);
  }

  private emitGameState(game: GameState, code: string) {
    for (const { socketId, playerId } of this.gamesSockets.get(code)) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('game-updated', game.getVisibleStateFor(playerId));
      }
    }
  }
}
