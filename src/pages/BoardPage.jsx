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
} from "@mui/material";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const STATUS_COLORS = {
  TODO: {
    bg: "#E3F2FD",      // light blue
    border: "#2196F3",
  },
  IN_PROGRESS: {
    bg: "#FFF8E1",      // light amber
    border: "#FF9800",
  },
  DONE: {
    bg: "#E8F5E9",      // light green
    border: "#4CAF50",
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
  const handleCreateTask = async ({ title, deadline }) => {
    setError("");
    try {
      await api.post(
        "/tasks",
        {
          title,
          deadline, // ISO string from <input type="datetime-local">
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.100",
        py: 4,
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Board
        </Typography>

        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
  <Grid container spacing={2} alignItems="flex-start">
          {STATUSES.map((status) => (
            <Grid item xs={12} md={4} key={status}>
  <Droppable droppableId={status}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  bgcolor: "grey.50",
                  minHeight: 200,
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {status === "TODO"
                      ? "To Do"
                      : status === "IN_PROGRESS"
                      ? "In Progress"
                      : "Done"}
                  </Typography>

                  {/* Admin-only quick add always creates TODO tasks (leftmost column) */}
                  {isAdmin && status === "TODO" && (
                    <TaskQuickAdd onAdd={(data) => handleCreateTask(data)} />
                  )}

                  {/* Tasks list for this status */}
                  <Box sx={{ mt: 1 }}>
                    {tasksByStatus[status].map((t, index) => (
  <Draggable draggableId={String(t.id)} index={index} key={t.id}>
    {(provided) => (
      <Paper
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        elevation={1}
        sx={{
  mb: 1.5,
  p: 1.5,
  borderRadius: 2,
  cursor: "grab",
  bgcolor: STATUS_COLORS[t.status].bg,
  borderLeft: `6px solid ${STATUS_COLORS[t.status].border}`,
  transition: "transform 0.1s ease, box-shadow 0.1s ease",
  "&:hover": {
    boxShadow: 3,
    transform: "scale(1.01)",
  },
}}
      >

                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          Status: {t.status}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          Assigned:{" "}
                          {t.assignedAt
                            ? new Date(t.assignedAt).toLocaleString()
                            : "-"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 1 }}
                        >
                          Deadline:{" "}
                          {t.deadline
                            ? new Date(t.deadline).toLocaleString()
                            : "-"}
                        </Typography>

                        {/* Only the board owner (activeUserId === currentUserId) can change status */}
                        {activeUserId === currentUserId && (
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleChangeStatus(t.id, "TODO")
                              }
                            >
                              To Do
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleChangeStatus(t.id, "IN_PROGRESS")
                              }
                            >
                              In Progress
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleChangeStatus(t.id, "DONE")
                              }
                            >
                              Done
                            </Button>
                          </Stack>
                        )}
                      </Paper>
    )}
  </Draggable>

                    ))}
                    {tasksByStatus[status].length === 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        No tasks in this column.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
              {provided.placeholder}
</div>
)}
</Droppable>
            </Grid>
          ))}
        </Grid>
        </DragDropContext>
      </Box>
    </Box>
  );
}

// small inline component for admin to add tasks (title + deadline)
function TaskQuickAdd({ onAdd }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    onAdd({ title: title.trim(), deadline });
    setTitle("");
    setDeadline("");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mb: 1.5, bgcolor: "grey.100", p: 1, borderRadius: 2 }}
    >
      <TextField
        placeholder="New task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        size="small"
        margin="dense"
        required
      />
      <TextField
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        fullWidth
        size="small"
        margin="dense"
        required
        InputLabelProps={{ shrink: true }}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{ mt: 1, textTransform: "none", borderRadius: 2 }}
      >
        Add Task
      </Button>
    </Box>
  );
}

export default BoardPage;
