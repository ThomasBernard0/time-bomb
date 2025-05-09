import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import { WorkspacePremium, Close } from "@mui/icons-material";
import { Player } from "../types";

const PlayerCard: React.FC<{
  player: Player;
  currentPlayer: Player;
  onKick: (playerId: string) => void;
}> = ({ player, currentPlayer, onKick }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Typography color={player.online ? "text.primary" : "text.disabled"}>
          {player.name}
        </Typography>
      </CardContent>
      {player.host && (
        <Box pr={2}>
          <WorkspacePremium />
        </Box>
      )}
      {currentPlayer.host && currentPlayer.id !== player.id && (
        <IconButton
          aria-label="Kick player"
          onClick={() => onKick(player.id)}
          size="small"
        >
          <Close />
        </IconButton>
      )}
    </Card>
  );
};

export default PlayerCard;
