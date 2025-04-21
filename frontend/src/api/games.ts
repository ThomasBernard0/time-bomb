import axios from "axios";
import { useEffect, useState } from "react";
import { Player } from "../types";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:3000";

export const createGame = async (token: string): Promise<{ code: string }> => {
  const res = await axios.post(
    `${BASE_URL}/games`,
    {},
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

export const useFetchPlayers = (code: string, token: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!code) return;
      try {
        const response = await fetch(`/api/games/lobby/${code}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des joueurs du lobby"
          );
        }

        const data = await response.json();
        setPlayers(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, [code]);
  return { players, loading, error };
};

export const joinGameByCode = async (
  code: string,
  token: string
): Promise<boolean> => {
  try {
    await axios.post(
      `${BASE_URL}/games/${code}/join`,
      {},
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
