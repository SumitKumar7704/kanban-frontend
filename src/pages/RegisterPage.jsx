import { useState } from "react";
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

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        username,
        password,
        fullName, // optional: remove if your User model doesn’t have it
      });
      setSuccess("Registration successful. You can now log in.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("register error", err.response || err);
      setError(
        err.response?.data?.message || "Registration failed. Try another username."
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.100",
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
            Create an Account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign up to start using the Kanban board.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Remove this block if your backend User doesn’t have fullName */}
            <TextField
              label="Full name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              margin="normal"
            />

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

            {success && (
              <Typography
                variant="body2"
                color="success.main"
                sx={{ mt: 1, mb: 1 }}
              >
                {success}
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
              Register
            </Button>

            <Button
              type="button"
              variant="text"
              fullWidth
              sx={{ mt: 1, textTransform: "none" }}
              onClick={() => navigate("/login")}
            >
              Already have an account? Log in
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default RegisterPage;
