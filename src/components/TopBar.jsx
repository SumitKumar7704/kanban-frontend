import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
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

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ minHeight: 64 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 600, cursor: "pointer" }}
          onClick={() => navigate("/boards")}
        >
          Kanban Board
        </Typography>

        {token && (
          <Box sx={{ mr: 2 }}>
            <Typography variant="body2">
              Signed in as <strong>{username}</strong>
            </Typography>
          </Box>
        )}

        {token ? (
          <Button
            color="inherit"
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", borderRadius: 999 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        ) : (
          <Button
            color="inherit"
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", borderRadius: 999 }}
            onClick={handleLogin}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
