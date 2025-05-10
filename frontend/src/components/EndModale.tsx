import { Box, Modal, Stack, Typography } from "@mui/material";
import { Player } from "../types";

type EndModaleProps = {
  showEndModal: boolean;
  gameState: any;
  closeModale: () => void;
};

const EndModale: React.FC<EndModaleProps> = ({
  showEndModal,
  gameState,
  closeModale,
}) => {
  if (!gameState.winner) return;
  return (
    <Modal
      open={showEndModal}
      onClose={() => closeModale()}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Typography id="modal-title" variant="h5" gutterBottom>
            🎉 Partie terminée !
          </Typography>
          <Box
            component="img"
            src={
              gameState.winner.role == "sherlock"
                ? "/images/role/sherlock.png"
                : "/images/role/moriarty.png"
            }
            alt="winner_role"
            width="100%"
            height="100%"
            borderRadius={2}
            sx={{
              objectFit: "cover",
            }}
          />
          <Box id="modal-description" sx={{ mb: 2 }}>
            <Typography>Les gagnants sont :</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {gameState.winner.players.map((player: Player) => (
              <Typography>{player.name}</Typography>
            ))}
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

export default EndModale;
