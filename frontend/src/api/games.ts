import api from "./api";
import { useEffect, useState } from "react";
import { GameState } from "../types";
import socket from "../socket";
import { useNavigate } from "react-router-dom";

export const createGame = async (token: string): Promise<{ code: string }> => {
  const res = await api.get(`/games`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const verifyGameCode = async (code: string, token: string) => {
  try {
    const response = await api.get(`/games/verify/${code}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Code de partie invalide ou partie terminée");
  }
};

export const useGameStateSocket = (code: string, token: string) => {
  const [gameState, setGameState] = useState<GameState>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!code) return;
    socket.on("game-updated", (updatedGameState: GameState) => {
      setGameState(updatedGameState);
      setLoading(false);
    });
    socket.on("kicked", () => {
      navigate("/hub");
    });
    const name = localStorage.getItem("name");
    socket.emit("join-game", { code, token, name });
    return () => {
      socket.emit("leave-game", { code });
      socket.off("game-updated");
      socket.off("kicked");
    };
  }, []);

  return { gameState, loading };
};
