export type CardColor = 'green' | 'red' | 'white';

export interface Card {
  id: string;
  color: CardColor;
  ownerId: string;
  revealed: boolean;
}

export interface Player {
  id: string;
  name: string;
}

export class GameState {
  code: string;
  players: Player[] = [];
  cards: Card[] = [];
  round: number;
  foundGreenCards: Card[] = [];
  status: string;

  constructor(code: string) {
    this.code = code;
  }

  addPlayer(player: Player) {
    this.players.push(player);
  }

  startGame() {
    this.status = 'in-progress';
    this.round = 1;
    this.distributeCards();
  }

  distributeCards() {
    const cardsColor = [
      'green',
      'green',
      'green',
      'green',
      'red',
      ...Array(15).fill('white'),
    ];
    const shuffledCardsColor = this.shuffleArray(cardsColor);
    const newCards: Card[] = [];
    for (let i = 0; i < 20; i++) {
      newCards.push({
        id: i.toString(),
        color: shuffledCardsColor[i],
        ownerId: this.players[i % this.players.length].id,
        revealed: false,
      });
    }
    this.cards = newCards;
  }

  shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  revealCard(cardId: string) {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) return;
    card.revealed = true;
  }

  getVisibleStateFor(playerId: string) {
    return {
      code: this.code,
      status: this.status,
      players: this.players,
      playerId,
      foundGreenCards: this.foundGreenCards,
      cards: this.cards.map((card) => {
        if (card.revealed || card.ownerId === playerId) {
          return {
            id: card.id,
            color: card.color,
            ownerId: card.ownerId,
            revealed: card.revealed,
          };
        } else {
          return {
            id: card.id,
            color: null,
            ownerId: card.ownerId,
            revealed: false,
          };
        }
      }),
    };
  }
}
