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
import { Game } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  private games: Map<string, GameState> = new Map();

  test(code: string): any {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    return gameState;
  }

  async createGameDB(code: string): Promise<Game> {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    const game = await this.prisma.game.create({
      data: {
        code: gameState.code,
        winnerRole: gameState.winner,
        playerGames: {
          create: gameState.players.map((player) => ({
            user: { connect: { id: player.id } },
            role: player.role,
            isWinner: gameState.winner === player.role,
          })),
        },
      },
      include: {
        playerGames: {
          include: {
            user: true,
          },
        },
      },
    });
    return game;
  }

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

  getGameState(code: string): GameState | undefined {
    return this.games.get(code);
  }

  removeGame(code: string): void {
    this.games.delete(code);
  }

  verifyGameCode(code: string): boolean {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return false;
    if (gameState.status === 'in-progress') return false;
    return true;
  }

  addPlayer(code: string, userId: string, name: string): void {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    const player: Player = {
      id: userId,
      name: name,
      online: true,
      host: gameState.players.length == 0 ? true : false,
      role: null,
    };
    gameState.players.push(player);
  }

  removePlayer(code: string, userId: string): void {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    const newPlayers = gameState.players.filter((p) => p.id != userId);
    gameState.players = newPlayers;
  }

  setOnline(code: string, userId: string): void {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    const player: Player = gameState.players.find((p) => p.id == userId);
    if (player) player.online = true;
  }

  setOffline(code: string, userId: string): void {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    const player: Player = gameState.players.find((p) => p.id == userId);
    if (player) player.online = false;
  }

  setName(code: string, userId: string, name: string): void {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    const player: Player = gameState.players.find((p) => p.id == userId);
    if (player) player.name = name;
  }

  isAllOffline(code: string): boolean {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return false;
    return gameState.players.filter((p) => p.online == true).length == 0;
  }

  getUsersId(code: string): string[] {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return [];
    return gameState.players.map((p) => p.id);
  }

  startGame(code: string): void {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    gameState.status = 'in-progress';
    gameState.statusUI = 'in-progress';
    gameState.winner = null;
    gameState.round = 1;
    gameState.revealed = 0;
    gameState.foundWireCards = 0;
    this.distributeCards(gameState);
    this.setInitialPlayer(gameState);
    this.setRoles(gameState);
  }

  distributeCards(gameState: GameState): void {
    const cardsType: CardType[] = this.getCardsType(gameState);
    const shuffledCardsType: CardType[] = this.shuffleArray(cardsType);
    const newCards: Card[] = [];
    for (let i = 0; i < cardsType.length; i++) {
      newCards.push({
        id: i.toString(),
        type: shuffledCardsType[i],
        ownerId: gameState.players[i % gameState.players.length].id,
        revealed: false,
      });
    }
    gameState.cards = newCards;
  }

  getCardsType(gameState: GameState): CardType[] {
    const numberOfPlayers: number = gameState.players.length;
    const totalCard: number = numberOfPlayers * (6 - gameState.round);
    const cardsType: CardType[] = ['bomb'];
    const remainingWire: number = numberOfPlayers - gameState.foundWireCards;
    for (let i = 0; i < remainingWire; i++) {
      cardsType.push('wire');
    }
    while (cardsType.length < totalCard) {
      cardsType.push('empty');
    }
    return cardsType;
  }

  setInitialPlayer(gameState: GameState): void {
    gameState.playerTurnId = this.shuffleArray(gameState.players)[0].id;
  }

  setRoles(gameState: GameState): void {
    const totalPlayers: number = gameState.players.length;
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
    gameState.players.forEach((player, i) => {
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
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return false;
    const player = gameState.players.find((p) => p.id == playerId);
    if (!player) return false;
    return player.host;
  }

  hasCorrectNumberOfPlayers(code: string): boolean {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return false;
    const numberOfPlayers: number = gameState.players.length;
    return numberOfPlayers >= 2 && numberOfPlayers <= 8;
  }

  isPlayerTurn(code: string, playerId: string): boolean {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return false;
    return playerId == gameState.playerTurnId;
  }

  isOpponentCard(code: string, playerId: string, cardId: string): boolean {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return false;
    const card: Card = gameState.cards.find((c) => c.id === cardId);
    if (!card) return false;
    return card.ownerId != playerId;
  }

  isEndOfRound(code: string): boolean {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return true;
    return (
      gameState.revealed == gameState.players.length &&
      gameState.status != 'ended'
    );
  }

  isEndOfGame(code: string): boolean {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return false;
    return gameState.status === 'ended';
  }

  setEndGameStatusUI(code: string): void {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    gameState.statusUI = 'ended';
  }

  handleReveal(code: string, cardId: string): boolean {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return false;
    const card: Card = gameState.cards.find((c) => c.id === cardId);
    if (!card) return false;
    if (card.type == 'wire') gameState.foundWireCards++;
    if (gameState.foundWireCards == gameState.players.length) {
      gameState.status = 'ended';
      gameState.winner = 'sherlock';
    }
    if (card.type == 'bomb') {
      gameState.status = 'ended';
      gameState.winner = 'moriarty';
    }
    card.revealed = true;
    gameState.revealed++;
    gameState.playerTurnId = card.ownerId;
    return this.isEndOfRound(code);
  }

  handleEndOfRound(code: string): void {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return;
    gameState.revealed = 0;
    gameState.round++;
    if (gameState.round === 5) {
      gameState.status = 'ended';
      gameState.winner = 'moriarty';
    }
    this.distributeCards(gameState);
  }

  getVisibleStateFor(code: string, userId: string): GameStateUI {
    const gameState: GameState = this.getGameState(code);
    if (!gameState) return null;
    return {
      code: gameState.code,
      status: gameState.statusUI,
      winner: gameState.winner
        ? {
            role: gameState.winner,
            players: gameState.players.filter(
              (p) => p.role === gameState.winner,
            ),
          }
        : null,
      players: gameState.players.map((p) => ({
        id: p.id,
        name: p.name,
        online: p.online,
        host: p.host,
        role: null,
      })),
      player: gameState.players.find((p) => p.id == userId),
      playerTurnId: gameState.playerTurnId,
      shouldRedistribute: gameState.revealed == 0,
      foundWireCards: gameState.foundWireCards,
      cards: gameState.cards.map((card) => {
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
