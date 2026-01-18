import { useState } from "react";
import RegisterPage from "./RegisterPage.jsx";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { username, password });
      const { token, userId, isAdmin } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("isAdmin", isAdmin);
      localStorage.setItem("username", username);
      navigate("/boards");
    } catch (err) {
      console.error("login error", err.response || err);
      setError("Login failed. Check username/password.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E4ECF5 25%, #ADD8E6 100%)",
        backgroundAttachment: "fixed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Card
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Kanban Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage your boards and tasks.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              margin="normal"
            />

            {error && (
              <Typography
                variant="body2"
                color="error"
                sx={{ mt: 1, mb: 1 }}
              >
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                borderRadius: 2,
                textTransform: "none",
                py: 1.2,
              }}
            >
              Login
            </Button>

            <Button
              type="button"
              variant="text"
              fullWidth
              sx={{ mt: 1, textTransform: "none" }}
              onClick={() => navigate("/register")}
            >
              New here? Create an account
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;
