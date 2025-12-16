
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366F1", // indigo
    },
    secondary: {
      main: "#F97316", // orange accent
    },
    background: {
      default: "#0F172A", // dark slate background
      paper: "rgba(15, 23, 42, 0.8)", // translucent for glassmorphism
    },
    text: {
      primary: "#E5E7EB",
      secondary: "#9CA3AF",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Poppins", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(18px)",
          background: "linear-gradient(135deg, rgba(30,64,175,0.35), rgba(15,23,42,0.9))",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          boxShadow: "0 18px 45px rgba(15,23,42,0.7)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(16px)",
          background: "rgba(15, 23, 42, 0.85)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
