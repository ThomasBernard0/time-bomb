import React from "react";
import { useParams } from "react-router-dom";
import { Typography, Stack, Button } from "@mui/material";
import { joinGameByCode, useFetchPlayers } from "../api/games";
import { useAuth } from "../context/AuthContext";

const Lobby: React.FC = () => {
  const { token } = useAuth();
  const { code } = useParams<{ code: string }>();
  if (!code || !token) return;
  const { players, loading, error } = useFetchPlayers(code, token);

  if (loading) return <div>Chargement...</div>;
  return (
    <Stack spacing={3} alignItems="center" mt={5}>
      <Typography variant="h4">Lobby de la partie {code}</Typography>

      <Stack spacing={1}>
        {players.map((player) => (
          <Typography key={player.id}>a</Typography>
        ))}
      </Stack>
    </Stack>
  );
};

export default Lobby;
