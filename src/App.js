import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import LoginPage from "./pages/LoginPage";
import BoardListPage from "./pages/BoardListPage";
import BoardPage from "./pages/BoardPage";
import RegisterPage from "./pages/RegisterPage";
// import the top bar
import TopBar from "./components/TopBar";

function App() {
  const token = localStorage.getItem("token");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {token && <TopBar />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/boards"
            element={token ? <BoardListPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/boards/:boardId"
            element={token ? <BoardPage /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
