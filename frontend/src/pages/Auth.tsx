import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Link,
  Paper,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { postLogin, postRegister } from "../api/auth";

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (username.length < 6) {
      setError("Le nom d'utilisateur doit contenir au moins 6 caractères.");
      return;
    }
    try {
      const res = isRegister
        ? await postRegister(username, password)
        : await postLogin(username, password);
      const token = res.data.access_token;
      login(token);
      navigate("/hub");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de connexion");
    }
  };

  const handleChangeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegister(!isRegister);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          {isRegister ? "Créer un compte" : "Connexion"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Username"
            type="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            {isRegister ? "S'inscrire" : "Se connecter"}
          </Button>

          <Box mt={2} textAlign="center">
            <Typography variant="body2">
              {isRegister ? "Déjà un compte ? " : "Pas encore de compte ? "}
              <Link component="button" onClick={handleChangeForm}>
                {isRegister ? "Se connecter" : "S'inscrire"}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
