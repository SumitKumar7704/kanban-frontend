import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
} from "@mui/material";

function TopBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("username");
    localStorage.removeItem("activeUserId");
    navigate("/login", { replace: true });
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleHome = () => {
    if (token) {
      navigate("/boards");
    } else {
      navigate("/login");
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        left: 0,
        right: 0,
        background:
          "linear-gradient(90deg, rgba(15,23,42,0.95), rgba(30,64,175,0.85))",
        borderBottom: "1px solid rgba(148,163,184,0.4)",
        backdropFilter: "blur(18px)",
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={handleHome}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "30%",
              mr: 1.2,
              background:
                "conic-gradient(from 180deg at 50% 50%, #6366f1, #ec4899, #22c55e, #6366f1)",
              boxShadow: "0 0 18px rgba(129,140,248,0.9)",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            My Work Planner
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          {token && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Signed in as <strong>{username}</strong>
            </Typography>
          )}

          <Button
            color="inherit"
            size="small"
            onClick={handleHome}
            sx={{ textTransform: "none" }}
          >
            Boards
          </Button>

          {token ? (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleLogout}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 2.5,
                borderColor: "rgba(209,213,219,0.8)",
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={handleLogin}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                px: 2.5,
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                boxShadow: "0 10px 24px rgba(15,23,42,0.9)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f46e5, #7c3aed, #db2777)",
                },
              }}
            >
              Login
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
