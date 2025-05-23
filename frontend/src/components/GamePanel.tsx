import { Box, Paper, Stack } from "@mui/material";
import { Card, GameState } from "../types";
import CardDisplayer from "./CardDisplayer";
import RoleCard from "./RoleDisplayer";
import NameDisplayer from "./NameDisplayer";
import WireCounter from "./WireCounter";
import { useEffect, useState } from "react";

const GamePanel: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const [distributionId, setDistributionId] = useState<number>(0);

  useEffect(() => {
    if (gameState.shouldRedistribute) {
      setDistributionId((id) => id + 1);
    }
  }, [gameState.shouldRedistribute]);

  const getPlayerCards = () => {
    return gameState?.cards.filter(
      (card) => card.ownerId == gameState.player.id
    );
  };

  const groupCardsByUser = (): Record<string, Card[]> | undefined => {
    return gameState?.cards.reduce((acc, card) => {
      if (card.ownerId === gameState?.player.id) return acc;

      if (!acc[card.ownerId]) {
        acc[card.ownerId] = [];
      }
      acc[card.ownerId].push(card);
      return acc;
    }, {} as Record<string, Card[]>);
  };

  const playerCards = getPlayerCards();
  const otherPlayersCards = groupCardsByUser();

  if (!otherPlayersCards) return;

  const n = Object.keys(otherPlayersCards).length;
  const radius = 0.4;
  const centerX = 0.5;
  const centerY = 0.42;
  const totalAngle = (Math.PI * 5) / 6;
  const startAngle = Math.PI / 2 + totalAngle / 2;
  const step = totalAngle / (n > 1 ? n - 1 : 1);

  const angles = Array.from({ length: n }, (_, i) => startAngle - i * step);

  return (
    <Box position="relative" width="100%" height="100vh" overflow="hidden">
      <Box
        position="absolute"
        sx={{
          left: "50%",
          top: "79%",
          transform: `translateX(-50%)`,
        }}
      >
        <Paper elevation={3} sx={{ p: 1, bgcolor: "grey.200" }}>
          <Stack spacing={1}>
            <Box display="flex" justifyContent="center" gap={0.5}>
              {playerCards.map((c, idx) => (
                <CardDisplayer
                  key={c.id}
                  card={c}
                  playerId={gameState.player.id}
                  code={gameState.code}
                  delay={idx * 0.2}
                  distributionId={distributionId}
                />
              ))}
            </Box>
            <NameDisplayer
              player={gameState.player}
              isTurn={gameState.player.id == gameState.playerTurnId}
            />
          </Stack>
        </Paper>
      </Box>

      {Object.entries(otherPlayersCards).map(([ownerId, cards], idx) => {
        const player = gameState!.players.find((p) => p.id === ownerId)!;
        const angle = angles[idx];
        const x = centerX + radius * 1.05 * Math.cos(angle);
        const y = centerY - radius * 2 * Math.sin(angle) + 0.2;
        return (
          <Box
            key={player.id}
            position="absolute"
            sx={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: `translate(-50%, 100%)`,
            }}
          >
            <Paper elevation={3} sx={{ p: 1, bgcolor: "grey.200" }}>
              <Stack spacing={1}>
                <NameDisplayer
                  player={player}
                  isTurn={player.id == gameState.playerTurnId}
                />
                <Box display="flex" justifyContent="center" gap={0.5}>
                  {cards.map((c, idx) => (
                    <CardDisplayer
                      key={c.id}
                      card={c}
                      playerId={gameState.player.id}
                      code={gameState.code}
                      delay={idx * 0.2}
                      distributionId={distributionId}
                    />
                  ))}
                </Box>
              </Stack>
            </Paper>
          </Box>
        );
      })}
      <RoleCard gameState={gameState} />
      <WireCounter count={gameState.foundWireCards} />
    </Box>
  );
};

export default GamePanel;
