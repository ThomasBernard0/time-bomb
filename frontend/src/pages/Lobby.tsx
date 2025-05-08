import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Stack, Box, CircularProgress } from "@mui/material";
import { useGameStateSocket } from "../api/games";
import { useAuth } from "../context/AuthContext";
import GamePanel from "../components/GamePanel";
import EndModale from "../components/EndModale";
import NoGameFound from "../components/NoGameFound";
import GameLobby from "../components/GameLobby";

const Lobby: React.FC = () => {
  const { token } = useAuth();
  const { code } = useParams<{ code: string }>();
  if (!code || !token) return null;
  const { gameState, loading } = useGameStateSocket(code, token);

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
          <GameLobby gameState={gameState} />
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
