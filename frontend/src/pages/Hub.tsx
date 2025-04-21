import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, verifyGameCode } from "../api/games";
import { Button, TextField, Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Hub: React.FC = () => {
  const { token } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    if (!token) return;
    try {
      const game = await createGame(token);
      navigate(`/lobby/${game.code}`);
    } catch (err) {
      setError("Erreur lors de la création de la partie.");
    }
  };

  const handleJoinGame = async () => {
    if (!token) return;
    try {
      const exists = await verifyGameCode(code, token);
      if (exists) {
        navigate(`/lobby/${code}`);
      } else {
        setError("Code de partie invalide.");
      }
    } catch (err) {
      setError("Impossible de rejoindre la partie.");
    }
  };

  return (
    <Stack spacing={3} alignItems="center" mt={8}>
      <Typography variant="h4">Bienvenue dans Time Bomb 💣</Typography>

      <Button variant="contained" color="primary" onClick={handleCreateGame}>
        Créer une partie
      </Button>

      <TextField
        label="Code de partie"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button variant="outlined" onClick={handleJoinGame}>
        Rejoindre
      </Button>

      {error && <Typography color="error">{error}</Typography>}
    </Stack>
  );
};

export default Hub;
