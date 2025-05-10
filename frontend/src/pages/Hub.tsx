import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame, verifyGameCode } from "../api/games";
import {
  Button,
  TextField,
  Stack,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Hub: React.FC = () => {
  const { token } = useAuth();
  const [name, setName] = useState(() => localStorage.getItem("name") || "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    if (!token) return;
    try {
      const code = await createGame(token);
      localStorage.setItem("name", name);
      navigate(`/lobby/${code}`);
    } catch (err) {
      setError("Erreur lors de la création de la partie.");
    }
  };

  const handleJoinGame = async () => {
    if (!token) return;
    try {
      const exists = await verifyGameCode(code, token);
      if (exists) {
        localStorage.setItem("name", name);
        navigate(`/lobby/${code}`);
      } else {
        setError("Code de partie invalide.");
      }
    } catch (err) {
      setError("Impossible de rejoindre la partie.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4">Bienvenue dans Time Bomb 💣</Typography>

          <TextField
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            disabled={!name}
            onClick={handleCreateGame}
          >
            Créer une partie
          </Button>

          <TextField
            label="Code de partie"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!code || !name}
            onClick={handleJoinGame}
          >
            Rejoindre
          </Button>

          {error && <Typography color="error">{error}</Typography>}
        </Stack>
      </Paper>
    </Container>
  );
};
export default Hub;
