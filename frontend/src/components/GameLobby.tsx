import {
  Typography,
  Paper,
  Container,
  Stack,
  Button,
  Divider,
} from "@mui/material";
import { GameState } from "../types";
import socket from "../socket";
import PlayerDisplayer from "./PlayerDisplayer";

const GameLobby: React.FC<{ gameState: GameState }> = ({ gameState }) => {
  const handleKick = (playerId: string) => {
    socket.emit("kick", { code: gameState.code, kickUserId: playerId });
  };

  const handleStartGame = () => {
    socket.emit("start-game", { code: gameState.code });
  };
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4">
            Lobby de la partie {gameState.code}
          </Typography>
          <Stack spacing={1}>
            {gameState.players.map((player, idx) => (
              <>
                {(idx == 4 || idx == 8) && <Divider />}
                <PlayerDisplayer
                  key={player.id}
                  player={player}
                  currentPlayer={gameState.player}
                  onKick={handleKick}
                />
              </>
            ))}
            <Button
              variant="contained"
              onClick={handleStartGame}
              disabled={gameState.players.length < 2 || !gameState.player.host}
            >
              Commencer la partie
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default GameLobby;
