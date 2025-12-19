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
  const [email, setEmail] = useState("");          // was username
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const errs = { email: "", password: "" };
    let ok = true;

    if (!email.trim()) {
      errs.email = "Email is required";
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address";
      ok = false;
    }

    if (!password) {
      errs.password = "Password is required";
      ok = false;
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
      ok = false;
    }

    setFieldErrors(errs);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      const { token, userId, isAdmin } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("isAdmin", isAdmin);
      localStorage.setItem("email", email);
      //localStorage.setItem("username", username); 

      navigate("/boards");
    } catch (err) {
      console.error("login error", err.response || err);
      setError("Login failed. Check email/password.");
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
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  fullWidth
                  required
                  margin="normal"
                  autoComplete="email"
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  fullWidth
                  required
                  margin="normal"
                  autoComplete="current-password"
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
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
