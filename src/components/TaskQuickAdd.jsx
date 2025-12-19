import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

function TaskQuickAdd({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("LOW"); // default LOW in UI

  const now = new Date().toISOString().slice(0, 16);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !deadline) return;

    onAdd({
      title: title.trim(),
      description: description.trim(),
      deadline,
      priority,
    });

    setTitle("");
    setDescription("");
    setDeadline("");
    setPriority("LOW");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        size="small"
        margin="dense"
        required
      />

      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        size="small"
        margin="dense"
        required
      />

      <TextField
        label="Deadline"
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        fullWidth
        size="small"
        margin="dense"
        required
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: now }}
      />

      <FormControl fullWidth size="small" margin="dense">
        <InputLabel>Priority</InputLabel>
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <MenuItem value="LOW">Low</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
        </Select>
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        size="small"
        sx={{
          mt: 1,
          textTransform: "none",
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          "&:hover": {
            background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
          },
        }}
      >
        Add Task
      </Button>
    </Box>
  );
}

export default TaskQuickAdd;
