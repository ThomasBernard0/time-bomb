export type CardColor = "green" | "red" | "white";

export interface Card {
  id: string;
  color: CardColor;
  ownerId: string;
  revealed: boolean;
}

export type GameState = {
  gameId: string;
  players: Player[];
  playerId: string;
  cards: Card[];
  round: number;
  foundGreenCards: Card[];
  status: string;
};

export type Player = {
  id: string;
  name: string;
  userId: string;
  gameId: string;
  isReady: boolean;
};

export type User = {
  id: string;
  email: string;
};
