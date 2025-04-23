import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography, Stack, Button } from "@mui/material";
import { useGameStateSocket } from "../api/games";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import GamePanel from "../components/GamePanel";
import EndModale from "../components/EndModale";

const Lobby: React.FC = () => {
  const { token } = useAuth();
  const { code } = useParams<{ code: string }>();
  if (!code || !token) return null;
  const { gameState } = useGameStateSocket(code, token);

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

  const startGame = () => {
    socket.emit("start-game", { code });
  };

  if (!gameState) return;

  return (
    <>
      <Stack spacing={3} alignItems="center" mt={5}>
        {gameState.status != "in-progress" ? (
          <>
            <Typography variant="h4">Lobby de la partie {code}</Typography>

            <Stack spacing={1}>
              {gameState.players.map((player) => (
                <Typography key={player.id}>{player.name}</Typography>
              ))}
              <Button
                variant="contained"
                onClick={startGame}
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
