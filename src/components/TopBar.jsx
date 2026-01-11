import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

function TopBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "User";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

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

  return (
    <AppBar
  position="static"
  sx={{
    background: 'linear-gradient(90deg, #2196F3, #21CBF3)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  }}
>
  <Toolbar sx={{ minHeight: 64 }}>
    <Typography
      variant="h6"
      sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1.2, cursor: "pointer" }}
      onClick={() => navigate("/boards")}
    >
      Kanban Board
    </Typography>

    {token && (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isAdmin && (
          <Chip
            icon={<AdminPanelSettingsIcon />}
            label="Admin"
            color="secondary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        )}
        {/* Signed in info */}
        {token && (
          <Box sx={{ mr: 2 }}>
            <Typography variant="body2">
              Signed in as <strong>{username}</strong>
            </Typography>
          </Box>
        )}
        <Button
          color="inherit"
          variant="outlined"
          size="small"
          sx={{ textTransform: "none", borderRadius: 999 }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    )}
  </Toolbar>
</AppBar>

  );
}

export default TopBar;
