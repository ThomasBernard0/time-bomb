import { useAuth } from "../context/AuthContext";
import { Button, Typography, Container } from "@mui/material";

export default function LobbyPage() {
  const { logout } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Bienvenue dans le Lobby
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        onClick={() => {
          logout();
        }}
      >
        Se déconnecter
      </Button>
    </Container>
  );
}
