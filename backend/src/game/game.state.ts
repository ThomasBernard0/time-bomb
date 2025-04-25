export type CardType = 'wire' | 'bomb' | 'empty';

type Role = 'sherlock' | 'moriarty';

export interface Card {
  id: string;
  type: CardType;
  ownerId: string;
  revealed: boolean;
}

export interface Player {
  id: string;
  name: string;
  role: Role;
}

export type GameStateUI = {
  code: string;
  status: string;
  winner: string;
  players: Player[];
  player: Player;
  playerTurnId: string;
  cards: Card[];
  foundWireCards: number;
};

export class GameState {
  code: string;
  players: Player[] = [];
  playerTurnId: string;
  cards: Card[] = [];
  revealed: number;
  round: number;
  foundWireCards: number;
  status: string;
  winner: Role;

  constructor(code: string) {
    this.code = code;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  startGame() {
    this.status = 'in-progress';
    this.round = 1;
    this.revealed = 0;
    this.foundWireCards = 0;
    this.distributeCards();
    this.setInitialPlayer();
    this.setRoles();
  }

  distributeCards() {
    const cardsType = this.getCardsType();
    const shuffledCardsType = this.shuffleArray(cardsType);
    const newCards: Card[] = [];
    for (let i = 0; i < cardsType.length; i++) {
      newCards.push({
        id: i.toString(),
        type: shuffledCardsType[i],
        ownerId: this.players[i % this.players.length].id,
        revealed: false,
      });
    }
    this.cards = newCards;
  }

  getCardsType() {
    const numberOfPlayers = this.players.length;
    const totalCard = numberOfPlayers * (6 - this.round);
    const cardsType = ['bomb'];
    const remainingWire = numberOfPlayers - this.foundWireCards;
    for (let i = 0; i < remainingWire; i++) {
      cardsType.push('wire');
    }
    while (cardsType.length < totalCard) {
      cardsType.push('empty');
    }
    return cardsType;
  }

  setInitialPlayer() {
    this.playerTurnId = this.shuffleArray(this.players)[0].id;
  }

  setRoles() {
    const totalPlayers = this.players.length;
    const moriartyMap = { 4: 2, 5: 2, 6: 2, 7: 3, 8: 3 };
    const sherlockMap = { 4: 3, 5: 3, 6: 4, 7: 5, 8: 5 };
    const moriartyCount = moriartyMap[totalPlayers];
    const sherlockCount = sherlockMap[totalPlayers];
    const roles: Role[] = [
      ...Array(moriartyCount).fill('moriarty'),
      ...Array(sherlockCount).fill('sherlock'),
    ];
    const shuffledRoles = this.shuffleArray(roles);
    this.players.forEach((player, i) => {
      player.role = shuffledRoles[i];
    });
  }

  shuffleArray(array: any[]) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  revealCard(cardId: string) {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return;
    if (card.type == 'wire') this.foundWireCards++;
    if (card.type == 'bomb') {
      this.status = 'ended';
      this.winner = 'moriarty';
    }
    card.revealed = true;
    this.revealed++;
    this.playerTurnId = card.ownerId;
  }

  checkSherlockWin() {
    if (this.foundWireCards == this.players.length) {
      this.status = 'ended';
      this.winner = 'sherlock';
    }
  }

  handleEndOfRound() {
    this.revealed = 0;
    this.round++;
    this.checkedOutOfRound();
    this.distributeCards();
  }

  checkedOutOfRound() {
    if (this.round === 5) {
      this.status = 'ended';
      this.winner = 'moriarty';
    }
  }

  getVisibleStateFor(playerId: string): GameStateUI {
    return {
      code: this.code,
      status: this.status,
      winner: this.winner,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        role: null,
      })),
      player: this.players.find((p) => p.id == playerId),
      playerTurnId: this.playerTurnId,
      foundWireCards: this.foundWireCards,
      cards: this.cards.map((card) => {
        if (card.revealed || card.ownerId === playerId) {
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
