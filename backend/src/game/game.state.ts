export type CardType = 'wire' | 'bomb' | 'empty';

export type Role = 'sherlock' | 'moriarty';

export type Card = {
  id: string;
  type: CardType;
  ownerId: string;
  revealed: boolean;
};

export type Player = {
  id: string;
  name: string;
  online: boolean;
  role: Role;
};

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
  players: Player[];
  playerTurnId: string;
  cards: Card[];
  revealed: number;
  round: number;
  foundWireCards: number;
  status: string;
  winner: Role;

  constructor(code: string) {
    this.code = code;
    this.players = [];
    this.cards = [];
  }
}
