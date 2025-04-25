export type CardColor = "green" | "red" | "white";

export interface Card {
  id: string;
  color: CardColor;
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
  foundGreenCards: number;
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
