import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar,            // <-- add
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function TopBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const storedName = localStorage.getItem("name");
  const storedUsername = localStorage.getItem("username");
  const storedEmail = localStorage.getItem("email");
  const profilePictureUrl = localStorage.getItem("profilePictureUrl") || "";

  const displayName = storedName || storedUsername || storedEmail || "User";
  const initial =
    (storedName && storedName.trim()[0]) ||
    (storedUsername && storedUsername.trim()[0]) ||
    (storedEmail && storedEmail.trim()[0]) ||
    "U";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("name");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("profilePictureUrl");
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBoardsClick = () => {
    handleHome();
    handleMenuClose();
  };

  const handleLoginClick = () => {
    handleLogin();
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    handleLogout();
    handleMenuClose();
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
          "linear-gradient(90deg, rgba(219,234,254,0.95), rgba(191,219,254,0.95))",
        borderBottom: "1px solid rgba(148,163,184,0.6)",
        backdropFilter: "blur(14px)",
        color: "#111827",
      }}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3 } }}>
        {/* Logo + title */}
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
              width: 30,
              height: 30,
              borderRadius: "30%",
              mr: 1.4,
              background:
                "conic-gradient(from 180deg at 50% 50%, #2563eb, #3b82f6, #60a5fa, #2563eb)",
              boxShadow: "0 0 16px rgba(37,99,235,0.6)",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.7,
              fontSize: { xs: "1.05rem", sm: "1.15rem" },
            }}
          >
            My Work Planner
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop actions */}
        {!isMobile && (
          <Stack direction="row" spacing={2.5} alignItems="center">
            {token && (
              <>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    src={profilePictureUrl || undefined}
                    alt={displayName}
                    sx={{ width: 32, height: 32 }}
                  >
                    {initial.toUpperCase()}
                  </Avatar>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Signed in as <strong>{displayName}</strong>
                  </Typography>
                </Stack>
              </>
            )}

            <Button
              color="inherit"
              size="medium"
              onClick={handleHome}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              Boards
            </Button>

            {token ? (
              <Button
                variant="outlined"
                color="inherit"
                size="medium"
                onClick={handleLogout}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  px: 3,
                  py: 0.7,
                  fontWeight: 600,
                  borderColor: "rgba(148,163,184,0.9)",
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="contained"
                size="medium"
                onClick={handleLogin}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  px: 3,
                  py: 0.7,
                  fontWeight: 600,
                  background:
                    "linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)",
                  boxShadow: "0 8px 18px rgba(37,99,235,0.35)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6)",
                  },
                }}
              >
                Login
              </Button>
            )}
          </Stack>
        )}

        {/* Mobile menu unchanged; you can add avatar similarly if you want */}
        {isMobile && (
          <>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {token && (
                <MenuItem disabled dense>
                  <Typography variant="body2">
                    Signed in as <strong>{displayName}</strong>
                  </Typography>
                </MenuItem>
              )}

              <MenuItem onClick={handleBoardsClick}>
                <Typography>Boards</Typography>
              </MenuItem>

              {token ? (
                <MenuItem onClick={handleLogoutClick}>
                  <Typography>Logout</Typography>
                </MenuItem>
              ) : (
                <MenuItem onClick={handleLoginClick}>
                  <Typography>Login</Typography>
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
