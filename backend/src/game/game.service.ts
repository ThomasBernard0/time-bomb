import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Card,
  CardType,
  GameState,
  GameStateUI,
  Player,
  Role,
} from './game.state';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  private games: Map<string, GameState> = new Map();

  createGame() {
    let code: string = null;
    while (!code) {
      const newCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      if (!this.games.has(newCode)) {
        const newGame = new GameState(newCode);
        this.games.set(newCode, newGame);
        code = newCode;
      }
    }
    return code;
  }

  getGame(code: string): GameState | undefined {
    return this.games.get(code);
  }

  removeGame(code: string): void {
    this.games.delete(code);
  }

  verifyGameCode(code: string): boolean {
    const game: GameState = this.getGame(code);
    if (!game) return false;
    if (game.status === 'in-progress') return false;
    return true;
  }

  addPlayer(code: string, userId: string, name: string): void {
    const game: GameState = this.getGame(code);
    if (!game) return;
    const player: Player = {
      id: userId,
      name: name,
      online: true,
      host: game.players.length == 0 ? true : false,
      role: null,
    };
    game.players.push(player);
  }

  removePlayer(code: string, userId: string): void {
    const game: GameState = this.getGame(code);
    if (!game) return;
    const newPlayers = game.players.filter((p) => p.id != userId);
    game.players = newPlayers;
  }

  setOnline(code: string, userId: string): void {
    const game: GameState = this.getGame(code);
    if (!game) return;
    const player: Player = game.players.find((p) => p.id == userId);
    if (player) player.online = true;
  }

  setOffline(code: string, userId: string): void {
    const game: GameState = this.getGame(code);
    if (!game) return;
    const player: Player = game.players.find((p) => p.id == userId);
    if (player) player.online = false;
  }

  setName(code: string, userId: string, name: string): void {
    const game: GameState = this.getGame(code);
    if (!game) return;
    const player: Player = game.players.find((p) => p.id == userId);
    if (player) player.name = name;
  }

  isAllOffline(code: string): boolean {
    const game: GameState = this.getGame(code);
    if (!game) return false;
    return game.players.filter((p) => p.online == true).length == 0;
  }

  getUsersId(code: string): string[] {
    const game: GameState = this.getGame(code);
    if (!game) return [];
    return game.players.map((p) => p.id);
  }

  startGame(code: string): void {
    const game: GameState = this.getGame(code);
    if (!game) return;
    game.status = 'in-progress';
    game.round = 1;
    game.revealed = 0;
    game.foundWireCards = 0;
    this.distributeCards(game);
    this.setInitialPlayer(game);
    this.setRoles(game);
  }

  distributeCards(game: GameState): void {
    const cardsType: CardType[] = this.getCardsType(game);
    const shuffledCardsType: CardType[] = this.shuffleArray(cardsType);
    const newCards: Card[] = [];
    for (let i = 0; i < cardsType.length; i++) {
      newCards.push({
        id: i.toString(),
        type: shuffledCardsType[i],
        ownerId: game.players[i % game.players.length].id,
        revealed: false,
      });
    }
    game.cards = newCards;
  }

  getCardsType(game: GameState): CardType[] {
    const numberOfPlayers: number = game.players.length;
    const totalCard: number = numberOfPlayers * (6 - game.round);
    const cardsType: CardType[] = ['bomb'];
    const remainingWire: number = numberOfPlayers - game.foundWireCards;
    for (let i = 0; i < remainingWire; i++) {
      cardsType.push('wire');
    }
    while (cardsType.length < totalCard) {
      cardsType.push('empty');
    }
    return cardsType;
  }

  setInitialPlayer(game: GameState): void {
    game.playerTurnId = this.shuffleArray(game.players)[0].id;
  }

  setRoles(game: GameState): void {
    const totalPlayers: number = game.players.length;
    const moriartyMap: { [key: number]: number } = {
      4: 2,
      5: 2,
      6: 2,
      7: 3,
      8: 3,
    };
    const sherlockMap: { [key: number]: number } = {
      4: 3,
      5: 3,
      6: 4,
      7: 5,
      8: 5,
    };
    const moriartyCount: number = moriartyMap[totalPlayers];
    const sherlockCount: number = sherlockMap[totalPlayers];
    const roles: Role[] = [
      ...Array(moriartyCount).fill('moriarty'),
      ...Array(sherlockCount).fill('sherlock'),
    ];
    const shuffledRoles: Role[] = this.shuffleArray(roles);
    game.players.forEach((player, i) => {
      player.role = shuffledRoles[i];
    });
  }

  shuffleArray(array: any[]): any[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  isPlayerHost(code: string, playerId: string): boolean {
    const game: GameState = this.getGame(code);
    if (!game) return false;
    const player = game.players.find((p) => p.id == playerId);
    if (!player) return false;
    return player.host;
  }

  hasCorrectNumberOfPlayers(code: string): boolean {
    const game: GameState = this.getGame(code);
    if (!game) return false;
    const numberOfPlayers: number = game.players.length;
    return numberOfPlayers >= 2 && numberOfPlayers <= 8;
  }

  isPlayerTurn(code: string, playerId: string): boolean {
    const game: GameState = this.getGame(code);
    if (!game) return false;
    return playerId == game.playerTurnId;
  }

  isOpponentCard(code: string, playerId: string, cardId: string): boolean {
    const game: GameState = this.getGame(code);
    if (!game) return false;
    const card: Card = game.cards.find((c) => c.id === cardId);
    if (!card) return false;
    return card.ownerId != playerId;
  }

  isEndOfRound(code: string): boolean {
    const game: GameState = this.getGame(code);
    if (!game) return true;
    return game.revealed == game.players.length && game.status != 'ended';
  }

  handleReveal(code: string, cardId: string): boolean {
    const game: GameState = this.getGame(code);
    if (!game) return false;
    const card: Card = game.cards.find((c) => c.id === cardId);
    if (!card) return false;
    if (card.type == 'wire') game.foundWireCards++;
    if (game.foundWireCards == game.players.length) {
      game.status = 'ended';
      game.winner = 'sherlock';
    }
    if (card.type == 'bomb') {
      game.status = 'ended';
      game.winner = 'moriarty';
    }
    card.revealed = true;
    game.revealed++;
    game.playerTurnId = card.ownerId;
    return this.isEndOfRound(code);
  }

  handleEndOfRound(code: string): void {
    const game: GameState = this.getGame(code);
    if (!game) return;
    game.revealed = 0;
    game.round++;
    if (game.round === 5) {
      game.status = 'ended';
      game.winner = 'moriarty';
    }
    this.distributeCards(game);
  }

  getVisibleStateFor(code: string, userId: string): GameStateUI {
    const game: GameState = this.getGame(code);
    if (!game) return null;
    return {
      code: game.code,
      status: game.status,
      winner: game.winner,
      players: game.players.map((p) => ({
        id: p.id,
        name: p.name,
        online: p.online,
        host: p.host,
        role: null,
      })),
      player: game.players.find((p) => p.id == userId),
      playerTurnId: game.playerTurnId,
      shouldRedistribute: game.revealed == 0,
      foundWireCards: game.foundWireCards,
      cards: game.cards.map((card) => {
        if (card.revealed || card.ownerId === userId) {
          return {
            id: card.id,
            type: card.type,
            ownerId: card.ownerId,
            revealed: card.revealed,
          };
        } else {
          return {
            id: card.id,
            type: null,
            ownerId: card.ownerId,
            revealed: false,
          };
        }
      }),
    };
  }
}
