import { Box, Modal, Typography } from "@mui/material";

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
        <Typography id="modal-title" variant="h5" gutterBottom>
          🎉 Partie terminée !
        </Typography>
        <Typography id="modal-description" sx={{ mb: 2 }}>
          L’équipe gagnante est : <strong>{gameState.winner}</strong>
        </Typography>
      </Box>
    </Modal>
  );
};

export default EndModale;
