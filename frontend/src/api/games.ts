import axios from "axios";
import { useEffect, useState } from "react";
import { Player } from "../types";

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

export const useFetchPlayers = (code: string, token: string) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!code) return;
      try {
        const response = await axios.get(`${BASE_URL}/games/${code}/players`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPlayers(response.data);
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
