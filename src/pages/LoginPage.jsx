import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
    >
      <Grid container maxWidth="md" spacing={10} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography
  variant="h3"
  fontWeight={700}
  gutterBottom
  sx={{
    background:
      "linear-gradient(135deg, #2563eb 0%, #60a5fa 40%, #93c5fd 90%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  }}
>
  Welcome back
</Typography>
<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
  Sign in to see your boards, track tasks, and keep work flowing
  across your Kanban columns.
</Typography>
<Typography variant="body2" color="text.secondary">
  Sign in with your account to access your boards and tasks in a clean,
  focused workspace.
</Typography>

        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={10}>
            <CardHeader
              title="Sign in"
              subheader="Enter your credentials to continue"
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  autoComplete="username"
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                  autoComplete="current-password"
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
  color="primary"
  fullWidth
  sx={{
    mt: 2,
    py: 1.1,
    background:
      "linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)",
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.35)",
    "&:hover": {
      background:
        "linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6)",
      boxShadow: "0 12px 28px rgba(30, 64, 175, 0.45)",
    },
  }}
  disabled={loading}
>
  {loading ? (
    <CircularProgress size={22} color="inherit" />
  ) : (
    "Login"
  )}
</Button>


                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 2 }}
                >
                  New here?{" "}
                  <Link
                    to="/register"
                    style={{ color: "#93c5fd", textDecoration: "none" }}
                  >
                    Create an account
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default LoginPage;
