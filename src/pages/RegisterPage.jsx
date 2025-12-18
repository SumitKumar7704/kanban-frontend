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
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: "100vh", px: 2 }}
    >
      <Grid item xs={12} sm={8} md={5} lg={4}>
        <Card>
          <CardHeader title="Create your workspace" />
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Plan work, set priorities, and move tasks across your Kanban board
              with a clean, focused interface.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                label="Username"
                value={form.username}
                onChange={handleChange("username")}
                fullWidth
                required
                margin="normal"
                autoComplete="username"
              />

              <TextField
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                fullWidth
                required
                margin="normal"
                autoComplete="new-password"
              />

              <TextField
                label="Confirm password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                fullWidth
                required
                margin="normal"
                autoComplete="new-password"
              />

              {/* account type text + toggle completely removed, as requested */}

              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}

              <Box sx={{ mt: 2 }}>
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Button type="submit" fullWidth variant="contained">
                    Create account
                  </Button>
                )}
              </Box>

              <Typography variant="body2" sx={{ mt: 2 }}>
                Already have an account?{" "}
                <Link to="/login">Sign in</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default RegisterPage;
