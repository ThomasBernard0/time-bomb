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

export class GameState {
  code: string;
  players: Player[] = [];
  playerTurnId: string;
  cards: Card[] = [];
  revealed: number;
  round: number;
  foundGreenCards: number;
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
    const totalCard = numberOfPlayers * (numberOfPlayers + 2 - this.round);
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
    const moriartyCount = 1;
    const sherlockCount = totalPlayers - moriartyCount;
    const roles: Role[] = [
      ...Array(moriartyCount).fill('moriarty'),
      ...Array(sherlockCount).fill('sherlock'),
    ];
    const shuffledRoles = this.shuffleArray(roles);
    this.players.forEach((player, i) => {
      player.role = shuffledRoles[i];
    });
  }

  countGreen() {
    const revealedCards = this.cards.filter((card) => card.revealed);
    revealedCards.forEach((revealedCard) => {
      if (revealedCard.color == 'green') this.foundGreenCards++;
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
    card.revealed = true;
    this.revealed++;
    this.playerTurnId = card.ownerId;
  }

  getVisibleStateFor(playerId: string) {
    return {
      code: this.code,
      status: this.status,
      players: this.players,
      playerId,
      role: this.players.find((player) => player.id == playerId).role,
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
