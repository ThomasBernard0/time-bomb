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
  players: Player[];
  playerId: string;
  role: string;
  foundGreenCards: Card[];
  cards: Card[];
};

export type Player = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
};
