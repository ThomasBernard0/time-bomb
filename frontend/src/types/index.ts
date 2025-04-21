export type Player = {
  id: string;
  name: string;
  userId: string;
  gameId: string;
  isReady: boolean;
};

export type Game = {
  id: string;
  code: string;
  hostId: string;
  createdAt: string;
  status: "waiting" | "started" | "finished";
};

export type User = {
  id: string;
  email: string;
};
