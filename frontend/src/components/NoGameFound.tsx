import { Box, Typography, Paper } from "@mui/material";

const NoGameFound: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" mt={8}>
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          maxWidth: 400,
          textAlign: "center",
          backgroundColor: "#ffebee",
        }}
      >
        <Typography variant="h5" gutterBottom color="error">
          Partie introuvable
        </Typography>
        <Typography variant="body1">
          Aucune partie n'a été trouvée avec ce code.
        </Typography>
      </Paper>
    </Box>
  );
};

export default NoGameFound;
