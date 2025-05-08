import axios from "axios";
import { useEffect, useState } from "react";
import { GameState } from "../types";
import socket from "../socket";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:3000";

export const createGame = async (token: string): Promise<{ code: string }> => {
  const res = await axios.get(`${BASE_URL}/games`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const verifyGameCode = async (code: string, token: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/games/verify/${code}`, {
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
    const username = localStorage.getItem("username");
    socket.emit("join-game", { code, token, name: username });
    return () => {
      socket.emit("leave-game", { code });
      socket.off("game-updated");
      socket.off("kicked");
    };
  }, []);

  return { gameState, loading };
};
