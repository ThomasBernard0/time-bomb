import { Card, CardContent, Typography, Box } from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { Player } from "../types";

const PlayerCard: React.FC<{
  player: Player;
}> = ({ player }) => {
  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 1,
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Typography color={player.online ? "text.primary" : "text.disabled"}>
          {player.name}
        </Typography>
      </CardContent>
      {player.host && (
        <Box pr={2}>
          <WorkspacePremiumIcon />
        </Box>
      )}
    </Card>
  );
};

export default PlayerCard;
