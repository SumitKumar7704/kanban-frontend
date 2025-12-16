import { useState } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    admin: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    const value =
      field === "admin" ? e.target.value === "true" : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdminToggle = (event, value) => {
    if (value === null) return;
    setForm((prev) => ({ ...prev, admin: value === "true" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        username: form.username,
        password: form.password,
        admin: form.admin,
      });
      navigate("/login");
    } catch (err) {
      const raw = err.response?.data;
      const msg =
        (typeof raw === "string"
          ? raw
          : raw?.message || raw?.error || JSON.stringify(raw)) ||
        "Registration failed";
      setError(msg);
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
      <Grid container maxWidth="md" spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography
            variant="h3"
            fontWeight={700}
            gutterBottom
            sx={{
              background:
                "linear-gradient(135deg, #6366f1 0%, #ec4899 40%, #22c55e 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create your workspace
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Plan work, set priorities, and move tasks across your Kanban board
            with a clean, focused interface.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose whether this account is an admin (can assign tasks to users)
            or a regular user focused on doing the work.
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={10}>
            <CardHeader
              title="Sign up"
              subheader="Create an account to start organizing your work"
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Username"
                  value={form.username}
                  onChange={handleChange("username")}
                  fullWidth
                  margin="normal"
                  required
                  autoComplete="username"
                />

                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  fullWidth
                  margin="normal"
                  required
                  autoComplete="new-password"
                />

                <TextField
                  label="Confirm password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  fullWidth
                  margin="normal"
                  required
                  autoComplete="new-password"
                />

                <Box mt={2} mb={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    Account type
                  </Typography>
                  <ToggleButtonGroup
                    value={String(form.admin)}
                    exclusive
                    onChange={handleAdminToggle}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value="false">User</ToggleButton>
                    <ToggleButton value="true">Admin</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

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
                      "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                    boxShadow: "0 12px 30px rgba(15,23,42,0.8)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #4f46e5, #7c3aed, #db2777)",
                    },
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Create account"
                  )}
                </Button>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 2 }}
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{ color: "#93c5fd", textDecoration: "none" }}
                  >
                    Sign in
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

export default RegisterPage;
