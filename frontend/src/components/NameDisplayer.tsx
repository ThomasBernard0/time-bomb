import { Box, Typography } from "@mui/material";
import { Player } from "../types";

const NameDisplayer: React.FC<{
  player: Player;
  isTurn: boolean;
}> = ({ player, isTurn }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          bgcolor: "lightgrey",
          height: "64px",
          width: "200px",
          border: "solid 1px black",
          borderRadius: "8px",
        }}
      >
        <Typography color={player.online ? "text.primary" : "text.disabled"}>
          {player.name}
        </Typography>
        {isTurn && (
          <Box
            component="img"
            src={"/images/utils/cutting_pliers.png"}
            alt="cutting_pliers"
            width="30px"
            height="45px"
            borderRadius={2}
          />
        )}
      </Box>
    </Box>
  );
};

export default NameDisplayer;
