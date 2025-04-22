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
    this.distributeCards();
  }

  distributeCards() {
    const allCards = [
      'green',
      'green',
      'green',
      'green',
      'red',
      ...Array(15).fill('white'),
    ];
    const shuffledCards = this.shuffleArray(allCards);

    let index = 0;
    this.players.forEach((playerId) => {
      this.cards[playerId.id] = shuffledCards.slice(index, index + 5);
      index += 5;
    });
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
    if (card.color === 'green') {
      this.foundGreenCards.push(card);
    }
  }

  getVisibleStateFor(playerId: string) {
    const test = {
      code: this.code,
      round: this.round,
      players: this.players,
      foundGreenCards: this.foundGreenCards,
      cards: this.cards.map((card) => {
        if (card.revealed || card.ownerId === playerId) {
          return {
            id: card.id,
            color: card.color,
            revealed: card.revealed,
          };
        } else {
          return {
            id: card.id,
            color: null,
            revealed: false,
          };
        }
      }),
    };
    console.log(test);
    return test;
  }
}
