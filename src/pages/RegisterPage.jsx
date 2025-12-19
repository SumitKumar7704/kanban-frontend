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
} from "@mui/material";

import { useNavigate, Link } from "react-router-dom";

import api from "../api";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    admin: false,
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    const value =
      field === "admin" ? e.target.value === "true" : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    // clear field-specific error as user types
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = { username: "", email: "", password: "", confirmPassword: "" };
    let ok = true;

    // username
    if (!form.username.trim()) {
      newErrors.username = "Username is required";
      ok = false;
    } else if (form.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      ok = false;
    }

    // email
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
      ok = false;
    }

    // password
    if (!form.password) {
      newErrors.password = "Password is required";
      ok = false;
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      ok = false;
    }

    // confirm password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      ok = false;
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = "Passwords do not match";
      ok = false;
    }

    setErrors(newErrors);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    try {
      setLoading(true);

      await api.post("/auth/register", {
        username: form.username,
        email: form.email,
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
                error={!!errors.username}
                helperText={errors.username}
              />

              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                fullWidth
                required
                margin="normal"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email}
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
                error={!!errors.password}
                helperText={errors.password}
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
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
              />

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
                Already have an account? <Link to="/login">Sign in</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default RegisterPage;
