import { Injectable } from '@nestjs/common';

@Injectable()
export class BiMapUserSocket {
  private userMap = new Map<string, { socketId: string; games: string[] }>();
  private socketMap = new Map<string, string>();

  set(userId: string, socketId: string, game: string) {
    this.userMap.set(userId, { socketId, games: [game] });
    this.socketMap.set(socketId, userId);
  }

  hasUser(userId: string): boolean {
    return this.userMap.has(userId);
  }

  hasSocket(socketId: string): boolean {
    return this.socketMap.has(socketId);
  }

  getFromUser(
    userId: string,
  ): { socketId: string; games: string[] } | undefined {
    return this.userMap.get(userId);
  }

  getFromSocket(socketId: string): string {
    return this.socketMap.get(socketId);
  }

  setSocketFromUser(userId: string, socketId: string): void {
    const userVal = this.userMap.get(userId);
    this.socketMap.delete(userVal.socketId);
    this.socketMap.set(socketId, userId);
    this.userMap.set(userId, { ...userVal, socketId });
  }

  addGameFromUser(userId: string, game: string): void {
    this.userMap.get(userId).games.push(game);
  }

  deleteGameFromUser(userId: string, game: string): void {
    const socketValue = this.userMap.get(userId);
    if (!socketValue) return;
    const newGames = this.userMap.get(userId).games.filter((g) => g != game);
    const socketId = this.userMap.get(userId).socketId;
    if (newGames.length == 0) {
      this.userMap.delete(userId);
      this.socketMap.delete(socketId);
    } else {
      this.userMap.set(userId, { socketId, games: newGames });
    }
  }

  hasGameFromUser(userId: string, game: string): boolean {
    const socketValue = this.userMap.get(userId);
    if (socketValue) return socketValue.games.includes(game);
    return false;
  }

  getGameFromUser(userId: string): string[] {
    const socketValue = this.userMap.get(userId);
    if (socketValue) return socketValue.games;
    return [];
  }

  clear() {
    this.userMap.clear();
    this.socketMap.clear();
  }
}
