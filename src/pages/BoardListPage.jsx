import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Stack,
} from "@mui/material";

function BoardListPage() {
  const [boards, setBoards] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const [activeUserId, setActiveUserId] = useState(
    localStorage.getItem("activeUserId") || currentUserId
  );

  // load all users for admin
  const loadUsers = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("load users error", err.response || err);
    }
  };

  const loadBoards = async () => {
    if (!activeUserId) {
      setError("No user id found. Please log in again.");
      return;
    }

    try {
      const res = await api.get(`/boards/user/${activeUserId}`);
      setBoards(res.data);
      setError("");
    } catch (err) {
      console.error("load boards error", err.response || err);
      setError("Failed to load boards");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!activeUserId) {
      setError("No user id found. Please log in again.");
      return;
    }

    if (!name.trim()) return;

    try {
      await api.post(
        "/boards",
        { name: name.trim() },
        { params: { userId: activeUserId } }
      );
      setName("");
      loadBoards();
    } catch (err) {
      console.error("create board error", err.response || err);
      setError("Failed to create board");
    }
  };

  // when admin changes selected user
  const handleUserChange = (e) => {
    const id = e.target.value;
    setActiveUserId(id);
    localStorage.setItem("activeUserId", id);
  };

  useEffect(() => {
    loadUsers();
  }, [isAdmin]);

  useEffect(() => {
    loadBoards();
  }, [activeUserId]);

  return (
    <Box
      minHeight="100vh"
      px={4}
      py={6}
      display="flex"
      justifyContent="center"
      sx={{
        background: "linear-gradient(135deg, #e0f2fe, #eff6ff)",
      }}
    >
      <Box maxWidth="900px" width="100%">
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
          mb={3}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Your boards
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create boards for different projects and jump into their Kanban
              views.
            </Typography>
          </Box>

          {isAdmin && (
            <FormControl
              size="small"
              sx={{
                minWidth: 220,
                mt: { xs: 1, md: 0 },
                bgcolor: "rgba(255,255,255,0.9)",
              }}
            >
              <InputLabel id="user-select-label">Select user</InputLabel>
              <Select
                labelId="user-select-label"
                value={activeUserId || ""}
                label="Select user"
                onChange={handleUserChange}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Stack>

        <Card
          elevation={6}
          sx={{
            borderRadius: 3,
            boxShadow: "0 18px 40px rgba(148,163,184,0.35)",
          }}
        >
          <CardContent>
            <Box
              component="form"
              onSubmit={handleCreate}
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={1.5}
              mb={2}
            >
              <TextField
                label="New board name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  minWidth: 140,
                  py: 1.2,
                  background:
                    "linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)",
                  boxShadow: "0 10px 24px rgba(37,99,235,0.35)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6)",
                    boxShadow: "0 12px 28px rgba(30,64,175,0.45)",
                  },
                }}
              >
                Create
              </Button>
            </Box>

            {error && (
              <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
                {error}
              </Typography>
            )}

            <List
              sx={{
                mt: 1,
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              {boards.map((b, idx) => (
                <ListItemButton
                  key={b.id}
                  onClick={() => navigate(`/boards/${b.id}`)}
                  sx={{
                    borderBottom:
                      idx === boards.length - 1
                        ? "none"
                        : "1px solid rgba(209,213,219,0.8)",
                    "&:hover": {
                      bgcolor: "rgba(191, 219, 254, 0.4)",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography fontWeight={500}>{b.name}</Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Click to open board
                      </Typography>
                    }
                  />
                </ListItemButton>
              ))}

              {boards.length === 0 && (
                <Box p={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    No boards yet. Create one to get started.
                  </Typography>
                </Box>
              )}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

export default BoardListPage;
