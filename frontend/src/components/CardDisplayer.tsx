import { Box } from "@mui/material";
import { Card } from "../types";

const CardDisplayer: React.FC<{ card: Card; playedId: string }> = ({
  card,
  playedId,
}) => (
  <Box
    width={60}
    height={90}
    borderRadius={1}
    bgcolor={
      card.revealed || card.ownerId == playedId ? card.color : "grey.500"
    }
    border="1px solid black"
  />
);

export default CardDisplayer;
