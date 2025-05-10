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
  winner: { role: string; players: Player[] };
  players: Player[];
  player: Player;
  playerTurnId: string;
  shouldRedistribute: boolean;
  cards: Card[];
  foundWireCards: number;
};

export type Player = {
  id: string;
  name: string;
  online: boolean;
  host: boolean;
  role: string;
};
