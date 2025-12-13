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
    try {
      await api.post(
        "/boards",
        { name },
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
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.100",
        py: 6,
        px: 2,
      }}
    >
      <Card
        elevation={3}
        sx={{
          maxWidth: 720,
          mx: "auto",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Your Boards
          </Typography>

          {isAdmin && (
            <Box sx={{ mt: 2, mb: 3 }}>
              <FormControl fullWidth size="small">
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
            </Box>
          )}

          <Box component="form" onSubmit={handleCreate} sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                placeholder="New board name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Create
              </Button>
            </Stack>
          </Box>

          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <List
            sx={{
              mt: 1,
              borderRadius: 2,
              bgcolor: "grey.50",
            }}
          >
            {boards.map((b) => (
              <ListItemButton
                key={b.id}
                onClick={() => navigate(`/boards/${b.id}`)}
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "grey.200",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <ListItemText primary={b.name} />
              </ListItemButton>
            ))}
            {boards.length === 0 && (
              <Box sx={{ py: 2, px: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  No boards yet. Create one to get started.
                </Typography>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

export default BoardListPage;
