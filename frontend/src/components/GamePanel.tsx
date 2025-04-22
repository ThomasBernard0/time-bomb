import { Box, Typography } from "@mui/material";
import { Card, GameState } from "../types";
import CardDisplayer from "./CardDisplayer";

const GamePanel: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const getPlayerCards = () => {
    return gameState?.cards.filter(
      (card) => card.ownerId == gameState.playerId
    );
  };

  const groupCardsByUser = (): Record<string, Card[]> | undefined => {
    return gameState?.cards.reduce((acc, card) => {
      if (card.ownerId === gameState?.playerId) return acc;

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
  const centerY = 0.5;

  return (
    <Box position="relative" width="100%" height="90vh" bgcolor="green.50">
      <Box
        position="absolute"
        bottom={16}
        left="50%"
        display="flex"
        gap={1}
        sx={{ transform: "translateX(-50%)" }}
      >
        {playerCards.map((c) => (
          <CardDisplayer key={c.id} card={c} playedId={gameState.playerId} />
        ))}
      </Box>

      {Object.entries(otherPlayersCards).map(([ownerId, cards], idx) => {
        const player = gameState!.players.find((p) => p.id === ownerId)!;
        const angle = Math.PI * (1 - (idx + 1) / (n + 1));
        const x = centerX + radius * Math.cos(angle);
        const y = centerY - radius * Math.sin(angle);
        return (
          <Box
            key={player.id}
            position="absolute"
            sx={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              transform: `translate(-50%, -50%)`,
            }}
          >
            <Typography align="center" variant="subtitle2" mb={1}>
              {player.name}
            </Typography>
            <Box display="flex" gap={1}>
              {cards.map((c) => (
                <CardDisplayer
                  key={c.id}
                  card={c}
                  playedId={gameState.playerId}
                />
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default GamePanel;
