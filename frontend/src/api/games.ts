import axios from "axios";
import { useEffect, useState } from "react";
import { GameState } from "../types";
import socket from "../socket";

const BASE_URL = "http://localhost:3000";

export const createGame = async (
  username: string,
  token: string
): Promise<{ code: string }> => {
  const res = await axios.post(
    `${BASE_URL}/games`,
    { name: username },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};

export const verifyGameCode = async (code: string, token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/games/${code}/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Code de partie invalide ou partie terminée");
  }
};

export const joinGameByCode = async (
  code: string,
  username: string,
  token: string
): Promise<boolean> => {
  try {
    await axios.post(
      `${BASE_URL}/games/${code}/join`,
      { name: username },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const useGameStateSocket = (code: string, token: string) => {
  const [gameState, setGameState] = useState<GameState>();

  useEffect(() => {
    if (!code) return;
    socket.on("game-updated", (updatedGameState: GameState) => {
      setGameState(updatedGameState);
    });
    socket.emit("join-game", { code, token });
    return () => {
      socket.off("game-updated");
    };
  }, [code, token]);

  return { gameState };
};
