export type CardColor = 'green' | 'red' | 'white';

type Role = 'sherlock' | 'moriarty';

export interface Card {
  id: string;
  color: CardColor;
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
  foundGreenCards: number;
};

export class GameState {
  code: string;
  players: Player[] = [];
  playerTurnId: string;
  cards: Card[] = [];
  revealed: number;
  round: number;
  foundGreenCards: number;
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
    this.foundGreenCards = 0;
    this.distributeCards();
    this.setInitialPlayer();
    this.setRoles();
  }

  distributeCards() {
    const cardsColor = this.getCardsColor();
    const shuffledCardsColor = this.shuffleArray(cardsColor);
    const newCards: Card[] = [];
    for (let i = 0; i < cardsColor.length; i++) {
      newCards.push({
        id: i.toString(),
        color: shuffledCardsColor[i],
        ownerId: this.players[i % this.players.length].id,
        revealed: false,
      });
    }
    this.cards = newCards;
  }

  getCardsColor() {
    const numberOfPlayers = this.players.length;
    const totalCard = numberOfPlayers * (6 - this.round);
    const cardsColor = ['red'];
    const remainingGreen = numberOfPlayers - this.foundGreenCards;
    for (let i = 0; i < remainingGreen; i++) {
      cardsColor.push('green');
    }
    while (cardsColor.length < totalCard) {
      cardsColor.push('white');
    }
    return cardsColor;
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
    if (card.color == 'green') this.foundGreenCards++;
    if (card.color == 'red') {
      this.status = 'ended';
      this.winner = 'moriarty';
    }
    card.revealed = true;
    this.revealed++;
    this.playerTurnId = card.ownerId;
  }

  checkSherlockWin() {
    if (this.foundGreenCards == this.players.length) {
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
