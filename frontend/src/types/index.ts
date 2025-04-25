export type CardType = "wire" | "bomb" | "empty";

export interface Card {
  id: string;
  type: CardType;
  ownerId: string;
  revealed: boolean;
}

export type GameState = {
  code: string;
  status: string;
  winner: string;
  players: Player[];
  player: Player;
  playerTurnId: string;
  cards: Card[];
  foundWireCards: number;
};

export type Player = {
  id: string;
  name: string;
  role: string;
};

export type User = {
  id: string;
  email: string;
};
