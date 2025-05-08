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
import { BiMapUserSocket } from 'src/utils/BiMapUserSocket';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private gameService: GameService,
    private authService: AuthService,
    private biMap: BiMapUserSocket,
  ) {}

  handleConnection(socket: Socket): void {}

  handleDisconnect(socket: Socket): void {
    const userId = this.biMap.getFromSocket(socket.id);
    const games = this.biMap.getGameFromUser(userId);
    for (const code of games) {
      this.gameService.setOffline(code, userId);
      this.handleDeleteGame(code);

      this.emitGameState(code);
    }
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

    if (this.biMap.hasUser(userId)) {
      const oldSocketId = this.biMap.getFromUser(userId).socketId;
      if (oldSocketId != socket.id) {
        const games = this.biMap.getGameFromUser(userId);
        for (const game of games) {
          this.kick(oldSocketId, game);
        }
        this.biMap.setSocketFromUser(userId, socket.id);
      }
      if (this.biMap.hasGameFromUser(userId, code)) {
        this.gameService.setOnline(code, userId);
        this.gameService.setName(code, userId, name);
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

  @SubscribeMessage('leave-game')
  handleLeave(socket: Socket, data: { code: string }): void {
    const { code } = data;
    const userId = this.biMap.getFromSocket(socket.id);
    if (!userId) return;

    this.gameService.removePlayer(code, userId);
    this.biMap.deleteGameFromUser(userId, code);
    this.handleDeleteGame(code);

    this.emitGameState(code);
  }

  @SubscribeMessage('kick')
  handleKick(socket: Socket, data: { code: string; kickUserId: string }): void {
    const { code, kickUserId } = data;
    const userId = this.biMap.getFromSocket(socket.id);
    if (!this.gameService.isPlayerHost(code, userId)) return;

    this.gameService.removePlayer(code, kickUserId);

    const kickSocketValue = this.biMap.getFromUser(kickUserId);
    if (kickSocketValue) {
      this.kick(kickSocketValue.socketId, code);
      this.biMap.deleteGameFromUser(kickUserId, code);
      this.handleDeleteGame(code);
    }

    this.emitGameState(code);
  }

  async kick(socketId: string, code: string): Promise<void> {
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      await socket.leave(code);
      socket.emit('kicked');
    }
  }

  handleDeleteGame(code) {
    if (this.gameService.isAllOffline(code)) {
      const usersId = this.gameService.getUsersId(code);
      this.gameService.removeGame(code);
      for (const id of usersId) {
        this.biMap.deleteGameFromUser(id, code);
      }
    }
  }

  @SubscribeMessage('start-game')
  handleStartGame(socket: Socket, data: { code: string }): void {
    const { code } = data;
    const userId = this.biMap.getFromSocket(socket.id);
    if (!this.gameService.isPlayerHost(code, userId)) return;

    this.gameService.startGame(code);

    this.emitGameState(code);
  }

  @SubscribeMessage('reveal-card')
  handleReveal(socket: Socket, data: { code: string; cardId: string }): void {
    const { code, cardId } = data;
    const userId = this.biMap.getFromSocket(socket.id);
    if (
      !this.gameService.isPlayerTurn(code, userId) ||
      !this.gameService.isOpponentCard(code, userId, cardId) ||
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
