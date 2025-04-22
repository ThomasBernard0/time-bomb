import { Box } from "@mui/material";
import { Card } from "../types";
import socket from "../socket";

const CardDisplayer: React.FC<{
  card: Card;
  playedId: string;
  code: string;
}> = ({ card, playedId, code }) => {
  const handleClick = () => {
    socket.emit("reveal-card", { code, cardId: card.id });
  };
  return (
    <Box
      width={60}
      height={90}
      borderRadius={1}
      bgcolor={
        card.revealed || card.ownerId == playedId ? card.color : "grey.500"
      }
      border="1px solid black"
      onClick={handleClick}
    />
  );
};

export default CardDisplayer;
