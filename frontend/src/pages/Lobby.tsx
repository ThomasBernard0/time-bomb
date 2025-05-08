import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Typography,
  Stack,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { useGameStateSocket } from "../api/games";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import GamePanel from "../components/GamePanel";
import EndModale from "../components/EndModale";
import PlayerDisplayer from "../components/PlayerDisplayer";
import NoGameFound from "../components/NoGameFound";

const Lobby: React.FC = () => {
  const { token } = useAuth();
  const { code } = useParams<{ code: string }>();
  if (!code || !token) return null;
  const { gameState, loading } = useGameStateSocket(code, token);

  const handleKick = (playerId: string) => {
    socket.emit("kick", { code, kickUserId: playerId });
  };

  const handleStartGame = () => {
    socket.emit("start-game", { code });
  };

  const [showEndModal, setShowEndModal] = useState(false);
  useEffect(() => {
    if (gameState?.status === "ended") {
      setShowEndModal(true);
    }
    if (gameState?.status === "in-progress") {
      setShowEndModal(false);
    }
  }, [gameState?.status]);

  const closeModale = () => {
    setShowEndModal(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!gameState) return <NoGameFound />;

  return (
    <>
      <Stack spacing={3} alignItems="center" mt={5}>
        {gameState.status != "in-progress" ? (
          <>
            <Typography variant="h4">Lobby de la partie {code}</Typography>

            <Stack spacing={1}>
              {gameState.players.map((player) => (
                <PlayerDisplayer
                  key={player.id}
                  player={player}
                  currentPlayer={gameState.player}
                  onKick={handleKick}
                />
              ))}
              <Button
                variant="contained"
                onClick={handleStartGame}
                disabled={gameState.players.length < 2}
              >
                Commencer la partie
              </Button>
            </Stack>
          </>
        ) : (
          <GamePanel gameState={gameState} />
        )}
      </Stack>
      <EndModale
        showEndModal={showEndModal}
        gameState={gameState}
        closeModale={closeModale}
      />
    </>
  );
};

export default Lobby;
