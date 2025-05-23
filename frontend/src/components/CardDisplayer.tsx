import { Box } from "@mui/material";
import { Card } from "../types";
import socket from "../socket";
import { motion } from "framer-motion";

const CardDisplayer: React.FC<{
  card: Card;
  playerId: string;
  code: string;
  delay: number;
  distributionId: number;
}> = ({ card, playerId, code, delay, distributionId }) => {
  const handleClick = () => {
    socket.emit("reveal-card", { code, cardId: card.id });
  };

  const getImage = () => {
    if (card.type == "bomb") return "/images/card/bomb.png";
    if (card.type == "wire") return "/images/card/wire.png";
    return "/images/card/empty.png";
  };
  return (
    <motion.div
      key={`${distributionId}-${card.id}`}
      initial={{
        opacity: 0,
        scale: 0.2,
        translateX: "50vw",
        translateY: "-50vh",
      }}
      animate={{
        opacity: 1,
        scale: 1,
        translateX: 0,
        translateY: 0,
      }}
      transition={{
        delay,
        duration: 0.6,
        type: "spring",
        damping: 20,
        stiffness: 100,
      }}
    >
      <Box
        width={60}
        height={90}
        onClick={handleClick}
        sx={{ cursor: "pointer", perspective: "1000px" }}
      >
        <motion.div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 8,
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateY: card.revealed ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            component="img"
            src={
              card.ownerId == playerId ? getImage() : "/images/card/back.png"
            }
            alt="front-card"
            width="100%"
            height="100%"
            borderRadius={2}
            sx={{
              objectFit: "cover",
              backfaceVisibility: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2,
            }}
          />
          <Box
            component="img"
            src={
              card.ownerId == playerId ? "/images/card/back.png" : getImage()
            }
            alt="back-card"
            width="100%"
            height="100%"
            borderRadius={2}
            sx={{
              objectFit: "cover",
              backfaceVisibility: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
              transform: "rotateY(180deg)",
            }}
          />
        </motion.div>
      </Box>{" "}
    </motion.div>
  );
};

export default CardDisplayer;
