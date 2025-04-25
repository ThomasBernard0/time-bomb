import { Box, Typography } from "@mui/material";
import { Card, GameState } from "../types";
import CardDisplayer from "./CardDisplayer";
import RoleCard from "./RoleDisplayer";

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
  const totalAngle = (Math.PI * 5) / 6;
  const startAngle = Math.PI / 2 + totalAngle / 2;
  const step = totalAngle / (n > 1 ? n - 1 : 1);

  const angles = Array.from({ length: n }, (_, i) => startAngle - i * step);

  return (
    <Box position="relative" width="100%" height="90vh">
      <Box
        position="absolute"
        bottom={16}
        left="50%"
        display="flex"
        gap={1}
        sx={{ transform: "translateX(-50%)" }}
      >
        {playerCards.map((c) => (
          <CardDisplayer
            key={c.id}
            card={c}
            playedId={gameState.playerId}
            code={gameState.code}
          />
        ))}
      </Box>

      {Object.entries(otherPlayersCards).map(([ownerId, cards], idx) => {
        const player = gameState!.players.find((p) => p.id === ownerId)!;
        const angle = angles[idx];
        const x = centerX + radius * Math.cos(angle);
        const y = centerY - radius * 1.5 * Math.sin(angle);
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
            <Typography align="center" variant="subtitle2" mb={1}>
              {player.name}
            </Typography>
            {gameState.playerTurnId == player.id && (
              <Typography>TOI</Typography>
            )}
            <Box display="flex" gap={1}>
              {cards.map((c) => (
                <CardDisplayer
                  key={c.id}
                  card={c}
                  playedId={gameState.playerId}
                  code={gameState.code}
                />
              ))}
            </Box>
          </Box>
        );
      })}
      <RoleCard gameState={gameState} />
    </Box>
  );
};

export default GamePanel;
