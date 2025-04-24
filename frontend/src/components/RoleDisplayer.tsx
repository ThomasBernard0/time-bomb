import { useState } from "react";
import { motion } from "framer-motion";
import { Box } from "@mui/material";
import { GameState } from "../types";

const RoleCard: React.FC<{
  gameState: GameState;
}> = ({ gameState }) => {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped((prev) => !prev);
  };

  const getImage = () => {
    return gameState.role === "moriarty"
      ? "/images/role/moriarty.png"
      : "/images/role/sherlock.png";
  };

  return (
    <Box
      position="absolute"
      bottom={16}
      left={16}
      width={80}
      height={120}
      onClick={handleFlip}
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
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          component="img"
          src={getImage()}
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
          src="/images/role/back.png"
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
    </Box>
  );
};

export default RoleCard;
