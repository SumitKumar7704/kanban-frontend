import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import {
  MenuItem, 
  Pagination,
  Chip,
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
const PRIORITY_COLORS = {
  LOW: {
    bg: "#E8F5E9",      // soft green
    text: "#2E7D32",
    border: "#66BB6A",
  },
  MEDIUM: {
    bg: "#FFFDE7",     // soft yellow
    text: "#F9A825",
    border: "#FBC02D",
  },
  HIGH: {
    bg: "#FDECEA",     // soft red
    text: "#C62828",
    border: "#EF5350",
  },
};

//const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];



function BoardPage() {
  const { boardId } = useParams();
  const currentUserId = localStorage.getItem("userId"); // logged-in user
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const [search, setSearch] = useState("");
  // Track current page per column
const [pageByStatus, setPageByStatus] = useState({
  TODO: 1,
  IN_PROGRESS: 1,
  DONE: 1,
});

const tasksPerPage = 5;

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
  const handleCreateTask = async ({ title, description, priority, deadline }) => {
    setError("");
    try {
      await api.post(
        "/tasks",
        {
          title,
          description,
          priority,
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
 const allTasks = columns
  .flatMap((c) => c.tasks || [])
  .filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleChangePriority = async (taskId, newPriority) => {
  setError("");
  try {
    await api.patch(
  `/tasks/${taskId}/priority`,
  { priority: newPriority },
  {
    params: {
      adminId: currentUserId,
      targetUserId: activeUserId
    }
  }
);

    await loadColumns();
  } catch (err) {
    console.error("update priority error", err.response || err);
    setError("Failed to update priority");
  }
};

const handlePageChange = (status, newPage) => {
  setPageByStatus((prev) => ({ ...prev, [status]: newPage }));
};

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
    background: "linear-gradient(135deg, #E4ECF5 25%, #ADD8E6 100%)",
    backgroundAttachment: "fixed",
    py: 4,
    display: "flex",
    justifyContent: "center",
  }}
>
  <Box
    sx={{
      width: "100%",
      maxWidth: 1400,   // 🔥 keeps everything centered
      px: 2,
    }}
  >

        <Typography variant="h5" component="h2" gutterBottom>
          Board
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
  <TextField
    placeholder="Search tasks..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    fullWidth
    size="small"
    sx={{ maxWidth: 600 }}
  />
</Box>

{isAdmin && (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",   // 🔥 centers horizontally
      width: "100%",
      mb: 3,
    }}
  >
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        width: "100%",
        maxWidth: 600,             // 🔥 controls size, keeps center
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ mb: 1, fontWeight: 600, textAlign: "center" }}
      >
        Add Task
      </Typography>

      <TaskQuickAdd onAdd={handleCreateTask} />
    </Paper>
  </Box>
)}



        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
  <Box
    sx={{
      display: "flex",
      gap: 4,         
      width: "100%",
    }}
  >
    {STATUSES.map((status) => { 
      const startIndex = (pageByStatus[status] - 1) * tasksPerPage;
  const paginatedTasks = tasksByStatus[status].slice(
    startIndex,
    startIndex + tasksPerPage
  );
      return ( <Droppable key={status} droppableId={status}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flex: 1,              // each column equal width
              display: "flex",
              flexDirection: "column",
              minHeight: 200,
            }}
          >
            <Card
              elevation={2}
              sx={{ borderRadius: 3, bgcolor: "grey.50", width: "100%" }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {status === "TODO"
                    ? "To Do"
                    : status === "IN_PROGRESS"
                    ? "In Progress"
                    : "Done"}
                </Typography>

                  

                  {/* Tasks list for this status */}
                  <Box sx={{ mt: 1, flexGrow: 1, overflowY: "auto" }}>
                    {paginatedTasks.map((t, index) => (
  <Draggable draggableId={String(t.id)} index={index} key={t.id}>
    {(provided) => (
      <Paper
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        elevation={3}
        sx={{
    mb: 2,
    p: 2,
    borderRadius: 3,
    borderLeft: `6px solid ${STATUS_COLORS[t.status].border}`,
    bgcolor: STATUS_COLORS[t.status].bg,
    cursor: "grab",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
      transform: "scale(1.02)"
    }
  }}
      >

                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t.title}
                        </Typography>
                       {isAdmin ? (
  <TextField
    select
    size="small"
    value={t.priority || "MEDIUM"}
    disabled={t.status === "DONE"}   // ✅ KEY LINE
    onChange={(e) =>
      handleChangePriority(t.id, e.target.value)
    }
    sx={{
      width: 130,
      mt: 0.5,
      bgcolor: PRIORITY_COLORS[t.priority || "MEDIUM"].bg,
      opacity: t.status === "DONE" ? 0.6 : 1,
      cursor: t.status === "DONE" ? "not-allowed" : "pointer",
    }}
  >
    {["LOW", "MEDIUM", "HIGH"].map((p) => (
      <MenuItem key={p} value={p}>
        <Chip
          label={p}
          size="small"
          sx={{
            bgcolor: PRIORITY_COLORS[p].bg,
            color: PRIORITY_COLORS[p].text,
            border: `1px solid ${PRIORITY_COLORS[p].border}`,
            fontWeight: 600,
            width: "100%",
          }}
        />
      </MenuItem>
    ))}
  </TextField>
) : (
  <Chip
    label={t.priority || "MEDIUM"}
    size="small"
    sx={{
      bgcolor: PRIORITY_COLORS[t.priority || "MEDIUM"].bg,
      color: PRIORITY_COLORS[t.priority || "MEDIUM"].text,
      border: `1px solid ${
        PRIORITY_COLORS[t.priority || "MEDIUM"].border
      }`,
      fontWeight: 600,
    }}
  />
)}


                        {t.description && (
                          <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5, mb: 0.5 }}
                          >
                        {t.description}
                          </Typography>)}

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
                  {tasksByStatus[status].length > tasksPerPage && (
  <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
    <Pagination
      count={Math.ceil(tasksByStatus[status].length / tasksPerPage)}
      page={pageByStatus[status]}
      onChange={(e, newPage) => handlePageChange(status, newPage)}
      size="small"
      color="primary"
    />
  </Box>
)}
                </CardContent>
              </Card>
              {provided.placeholder}
</Box>
)}
</Droppable>)})}
      
          
        </Box>
        </DragDropContext>
      </Box>
    </Box>
  );
}

// small inline component for admin to add tasks (title + deadline)
function TaskQuickAdd({ onAdd }) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const now = new Date().toISOString().slice(0, 16);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    onAdd({
  title: title.trim(),
  description: description.trim(),
  priority,
  deadline,
});
    setTitle("");
    setDeadline("");
    setDescription("");
    setPriority("MEDIUM");
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
        sx={{
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": {
        borderColor: "#2196F3",
        boxShadow: "0 0 5px #2196F3",
      }
    }
  }}
      />
      <TextField
  placeholder="Task description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  fullWidth
  size="small"
  margin="dense"
  multiline
  minRows={2}
/>
<TextField
  select
  label="Priority"
  value={priority}
  onChange={(e) => setPriority(e.target.value)}
  fullWidth
  size="small"
  margin="dense"
>
  <MenuItem value="LOW">Low</MenuItem>
  <MenuItem value="MEDIUM">Medium</MenuItem>
  <MenuItem value="HIGH">High</MenuItem>
</TextField>
      <TextField
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
