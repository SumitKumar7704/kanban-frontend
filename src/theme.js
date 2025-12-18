import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563EB", // blue-600
    },
    secondary: {
      main: "#F97316", // orange accent (kept)
    },
    background: {
      // light background with soft blue tint
      default: "#F3F4F6", // light gray
      paper: "rgba(255, 255, 255, 0.9)", // almost white for cards
    },
    text: {
      primary: "#111827", // near-black
      secondary: "#4B5563", // gray-600
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily:
      '"Poppins", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(18px)",
          // light blue gradient background
          background:
            "linear-gradient(135deg, rgba(191, 219, 254, 0.9), rgba(219, 234, 254, 0.95))",
          border: "1px solid rgba(148, 163, 184, 0.3)",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.15)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(16px)",
          background: "rgba(255, 255, 255, 0.9)",
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
