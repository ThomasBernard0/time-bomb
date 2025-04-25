import { Box } from "@mui/material";
import { Card, GameState } from "../types";
import CardDisplayer from "./CardDisplayer";
import RoleCard from "./RoleDisplayer";
import NameDisplayer from "./NameDisplayer";

const GamePanel: React.FC<{ gameState: GameState }> = ({ gameState }) => {
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
  const centerY = 0.5;
  const totalAngle = (Math.PI * 5) / 6;
  const startAngle = Math.PI / 2 + totalAngle / 2;
  const step = totalAngle / (n > 1 ? n - 1 : 1);

  const angles = Array.from({ length: n }, (_, i) => startAngle - i * step);

  return (
    <Box position="relative" width="100%" height="94vh" overflow="hidden">
      <Box
        position="absolute"
        sx={{
          left: "50%",
          top: "80%",
          transform: `translateX(-50%)`,
        }}
      >
        <Box display="flex" gap={1}>
          {playerCards.map((c) => (
            <CardDisplayer
              key={c.id}
              card={c}
              playerId={gameState.player.id}
              code={gameState.code}
            />
          ))}
        </Box>
        <NameDisplayer
          name={gameState.player.name}
          isTurn={gameState.player.id == gameState.playerTurnId}
        />
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
            <NameDisplayer
              name={player.name}
              isTurn={player.id == gameState.playerTurnId}
            />
            <Box display="flex" gap={1}>
              {cards.map((c) => (
                <CardDisplayer
                  key={c.id}
                  card={c}
                  playerId={gameState.player.id}
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
