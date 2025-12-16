import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Paper,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
} from "@mui/material";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

const STATUS_COLORS = {
  TODO: {
    bg: "rgba(37, 99, 235, 0.12)",
    border: "#60A5FA",
  },
  IN_PROGRESS: {
    bg: "rgba(234, 179, 8, 0.15)",
    border: "#FACC15",
  },
  DONE: {
    bg: "rgba(34, 197, 94, 0.15)",
    border: "#4ADE80",
  },
};

function BoardPage() {
  const { boardId } = useParams();
  const currentUserId = localStorage.getItem("userId"); // logged-in user
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  // Which user's board are we viewing? For now, same as logged in or from admin selection
  const activeUserId = localStorage.getItem("activeUserId") || currentUserId;

  const [columns, setColumns] = useState([]); // still load physical columns for tasks
  const [error, setError] = useState("");

  const loadColumns = async () => {
    if (!activeUserId || !boardId) return;
    try {
      const res = await api.get("/columns", {
        params: { userId: activeUserId, boardId },
      });
      setColumns(res.data);
      setError("");
    } catch (err) {
      console.error("load columns error", err.response || err);
      setError("Failed to load columns");
    }
  };

  // Admin: create task for activeUserId on this board (backend puts it into TODO)
  const handleCreateTask = async ({
    title,
    description,
    deadline,
    priority,
  }) => {
    setError("");
    try {
      await api.post(
        "/tasks",
        {
          title,
          description,
          deadline, // ISO string from datetime-local
          priority, // "LOW" | "MEDIUM" | "HIGH"
        },
        {
          params: {
            creatorId: currentUserId, // admin id
            userId: activeUserId, // user whose board this is
            boardId,
          },
        }
      );

      await loadColumns(); // tasks are still embedded in columns
    } catch (err) {
      console.error("create task error", err.response || err);
      const raw = err.response?.data;
      const msg =
        (typeof raw === "string"
          ? raw
          : raw?.message || raw?.error || JSON.stringify(raw)) ||
        "Failed to create task";
      setError(msg);
    }
  };

  // User: change task status (WIP check enforced backend)
  const handleChangeStatus = async (taskId, newStatus) => {
    setError("");
    try {
      await api.patch(
        `/tasks/${taskId}`,
        { status: newStatus },
        { params: { userId: activeUserId } }
      );
      await loadColumns();
    } catch (err) {
      console.error("update task error", err.response || err);
      const raw = err.response?.data;
      const msg =
        (typeof raw === "string"
          ? raw
          : raw?.message || raw?.error || JSON.stringify(raw)) ||
        "Failed to update task";
      setError(msg); // will show WIP limit error here
    }
  };

  // User/admin: change task priority only
  const handleChangePriority = async (taskId, newPriority) => {
    setError("");
    try {
      await api.patch(
        `/tasks/${taskId}`,
        { priority: newPriority }, // matches TaskPriority enum
        { params: { userId: activeUserId } }
      );
      await loadColumns();
    } catch (err) {
      console.error("update priority error", err.response || err);
      const raw = err.response?.data;
      const msg =
        (typeof raw === "string"
          ? raw
          : raw?.message || raw?.error || JSON.stringify(raw)) ||
        "Failed to update priority";
      setError(msg);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    // dropped outside
    if (!destination) return;

    // same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      await handleChangeStatus(draggableId, destination.droppableId);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId, boardId]);

  // Flatten tasks from all physical columns
  const allTasks = columns.flatMap((c) => c.tasks || []);

  // Group by logical status (3 fixed “columns”)
  const tasksByStatus = {
    TODO: allTasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: allTasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: allTasks.filter((t) => t.status === "DONE"),
  };

  const statusLabel = (status) => {
    if (status === "TODO") return "To Do";
    if (status === "IN_PROGRESS") return "In Progress";
    return "Done";
  };

  const priorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "error";
      case "LOW":
        return "info";
      default:
        return "warning";
    }
  };

  return (
    <Box
      px={5}
      py={5}
      minHeight="100vh"
      sx={{
        // slightly lighter overlay so the gradient behind is visible
        background: "radial-gradient(circle at top left, #1d4ed8 0, rgba(15,23,42,0.85) 45%, #a855f7 90%)",
      }}
    >
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: "#F9FAFB" }}>
            Board
          </Typography>
          <Typography variant="body2" sx={{ color: "#E5E7EB" }}>
            Drag tasks between columns, adjust priority, and watch WIP limits in action.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Box mb={2}>
          <Paper
            sx={{
              p: 1.5,
              bgcolor: "rgba(248, 113, 113, 0.12)",
              border: "1px solid rgba(248, 113, 113, 0.7)",
            }}
          >
            <Typography sx={{ color: "#FCA5A5" }} fontSize={14}>
              {error}
            </Typography>
          </Paper>
        </Box>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {STATUSES.map((status) => (
            <Grid item xs={12} md={4} key={status}>
              <Droppable droppableId={status}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      bgcolor: "rgba(15,23,42,0.4)", // lighter than before
                      borderRadius: 3,
                      p: 2,
                      minHeight: 280,
                      border: `1px solid ${STATUS_COLORS[status].border}`,
                      boxShadow: "0 12px 28px rgba(15,23,42,0.7)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0.35,                 // more visible soft color
                        background: STATUS_COLORS[status].bg,
                        pointerEvents: "none",
                      }}
                    />
                    <Box position="relative">
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{ mb: 1, color: "#F9FAFB" }}
                      >
                        {statusLabel(status)}
                      </Typography>

                      {isAdmin && status === "TODO" && (
                        <TaskQuickAdd onAdd={handleCreateTask} />
                      )}

                      {tasksByStatus[status].map((t, index) => (
                        <Draggable
                          key={t.id}
                          draggableId={t.id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                mb: 1.4,
                                bgcolor: "rgba(15,23,42,0.9)",
                                color: "#F9FAFB",
                              }}
                            >
                              <CardContent>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  mb={0.5}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                  >
                                    {t.title}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={t.priority || "MEDIUM"}
                                    color={priorityColor(t.priority || "MEDIUM")}
                                    variant="outlined"
                                  />
                                </Stack>

                                {t.description && (
                                  <Typography
                                    variant="body2"
                                    sx={{ mb: 0.5, color: "#E5E7EB" }}
                                  >
                                    {t.description}
                                  </Typography>
                                )}

                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{ color: "#E5E7EB" }}
                                >
                                  Status: <strong>{statusLabel(t.status)}</strong>
                                </Typography>

                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{ color: "#E5E7EB" }}
                                >
                                  Assigned:{" "}
                                  {t.assignedAt
                                    ? new Date(t.assignedAt).toLocaleString()
                                    : "-"}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{ color: "#E5E7EB" }}
                                >
                                  Deadline:{" "}
                                  {t.deadline
                                    ? new Date(t.deadline).toLocaleString()
                                    : "-"}
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  mt={1.2}
                                  alignItems="center"
                                  flexWrap="wrap"
                                >
                                  {activeUserId === currentUserId && (
                                    <>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        onClick={() =>
                                          handleChangeStatus(t.id, "TODO")
                                        }
                                      >
                                        To Do
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() =>
                                          handleChangeStatus(
                                            t.id,
                                            "IN_PROGRESS"
                                          )
                                        }
                                      >
                                        In Progress
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="success"
                                        onClick={() =>
                                          handleChangeStatus(t.id, "DONE")
                                        }
                                      >
                                        Done
                                      </Button>
                                    </>
                                  )}

                                  {activeUserId === currentUserId && (
                                    <FormControl
                                      size="small"
                                      sx={{ minWidth: 110, ml: 1 }}
                                    >
                                      <InputLabel
                                        id={`prio-${t.id}-label`}
                                      >
                                        Priority
                                      </InputLabel>
                                      <Select
                                        labelId={`prio-${t.id}-label`}
                                        value={t.priority || "MEDIUM"}
                                        label="Priority"
                                        onChange={(e) =>
                                          handleChangePriority(
                                            t.id,
                                            e.target.value
                                          )
                                        }
                                      >
                                        <MenuItem value="LOW">Low</MenuItem>
                                        <MenuItem value="MEDIUM">
                                          Medium
                                        </MenuItem>
                                        <MenuItem value="HIGH">High</MenuItem>
                                      </Select>
                                    </FormControl>
                                  )}
                                </Stack>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}

                      {tasksByStatus[status].length === 0 && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: "#E5E7EB" }}
                        >
                          No tasks in this column.
                        </Typography>
                      )}

                      {provided.placeholder}
                    </Box>
                  </Box>
                )}
              </Droppable>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Box>
  );
}


// small inline component for admin to add tasks (title + description + deadline + priority)
function TaskQuickAdd({ onAdd }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

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
    setPriority("MEDIUM");
  };

  return (
    <Paper
      sx={{ p: 1, mb: 1.2, bgcolor: "rgba(15,23,42,0.9)" }}
      component="form"
      onSubmit={handleSubmit}
    >
      <TextField
        label="Task title"
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
        inputProps={{
          min: now,
        }}
      />
      <FormControl fullWidth size="small" margin="dense">
        <InputLabel id="quick-priority-label">Priority</InputLabel>
        <Select
          labelId="quick-priority-label"
          value={priority}
          label="Priority"
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
        sx={{ mt: 1 }}
        fullWidth
      >
        Add Task
      </Button>
    </Paper>
  );
}

export default BoardPage;
