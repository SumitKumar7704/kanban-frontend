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
  Typography,
  TextField,
  Paper,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

const STATUS_COLORS = {
  TODO: {
    bg: "rgba(191, 219, 254, 0.6)",
    border: "#60A5FA",
  },
  IN_PROGRESS: {
    bg: "rgba(254, 240, 138, 0.65)",
    border: "#FACC15",
  },
  DONE: {
    bg: "rgba(187, 247, 208, 0.65)",
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

  // User remark state
  const [doneRemark, setDoneRemark] = useState({});
  const [remarkModeTaskId, setRemarkModeTaskId] = useState(null);

  // Admin remark state
  const [adminRemark, setAdminRemark] = useState({});

  // Dialog state for lock / override
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [lockDialogMessage, setLockDialogMessage] = useState("");
  const [lockDialogTaskId, setLockDialogTaskId] = useState(null);
  const [lockDialogTargetStatus, setLockDialogTargetStatus] = useState(null);
  const [overrideRemark, setOverrideRemark] = useState(""); // remark inside dialog

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
          priority, // backend will default to LOW if this is null
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
  const handleChangeStatus = async (taskId, newStatus, extraData = {}) => {
    setError("");
    try {
      await api.patch(
        `/tasks/${taskId}`,
        { status: newStatus, ...extraData }, // status + optional completionRemark
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

      // When backend says approved+locked
      if (msg.includes("approved and locked by the admin")) {
        // Admin trying to move back to TODO: show confirm dialog
        if (isAdmin && newStatus === "TODO") {
          setLockDialogTaskId(taskId);
          setLockDialogTargetStatus("TODO");
          setLockDialogMessage(
            "You have already marked this task as done. Do you still want to move this task to TODO?"
          );
          setOverrideRemark("");
          setLockDialogOpen(true);
          setError("");
        } else {
          // Normal user: simple info dialog
          setLockDialogTaskId(null);
          setLockDialogTargetStatus(null);
          setLockDialogMessage(msg);
          setOverrideRemark("");
          setLockDialogOpen(true);
          setError("");
        }
      } else {
        setError(msg); // WIP limit and other errors still show as red text
      }
    }
  };

  // Admin confirm: override approved lock and move to TODO with 20-word remark
  const handleLockDialogConfirm = async () => {
    if (!lockDialogTaskId || !lockDialogTargetStatus) {
      setLockDialogOpen(false);
      return;
    }

    const remark = (overrideRemark || "").trim();
    let finalRemark = remark;
    if (remark.length > 0) {
      const words = remark.split(/\s+/).filter(Boolean);
      if (words.length > 20) {
        finalRemark = words.slice(0, 20).join(" ");
      }
    }

    try {
      await api.patch(
        `/tasks/${lockDialogTaskId}/override-status`,
        {
          status: lockDialogTargetStatus,
          completionRemark: finalRemark || undefined,
        },
        {
          params: {
            adminId: currentUserId,
            userId: activeUserId,
          },
        }
      );
      await loadColumns();
    } catch (err) {
      console.error("override status error", err.response || err);
      const raw = err.response?.data;
      const msg =
        (typeof raw === "string"
          ? raw
          : raw?.message || raw?.error || JSON.stringify(raw)) ||
        "Failed to move task";
      setError(msg);
    } finally {
      setLockDialogOpen(false);
      setLockDialogTaskId(null);
      setLockDialogTargetStatus(null);
      setOverrideRemark("");
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

  // Admin review (approve / reject) with remark
  const handleReviewTask = async (taskId, approved, remark) => {
    setError("");
    try {
      await api.patch(
        `/tasks/${taskId}/review`,
        {},
        {
          params: {
            adminId: currentUserId, // logged-in admin
            userId: activeUserId, // board owner
            approved,
            remark,
          },
        }
      );
      await loadColumns();
    } catch (err) {
      console.error("review task error", err.response || err);
      const raw = err.response?.data;
      const msg =
        (typeof raw === "string"
          ? raw
          : raw?.message || raw?.error || JSON.stringify(raw)) ||
        "Failed to review task";
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

    // If dragged into DONE by owner, open remark mode instead of immediate update
    if (
      destination.droppableId === "DONE" &&
      activeUserId === currentUserId
    ) {
      setRemarkModeTaskId(draggableId);
      setDoneRemark((prev) => ({
        ...prev,
        [draggableId]: prev[draggableId] || "",
      }));
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: 2,
        py: 3,
        background: "linear-gradient(135deg, #e0f2fe, #eff6ff)",
      }}
    >
      <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
        Board
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drag tasks between columns, adjust priority, and watch WIP limits in
        action.
      </Typography>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="flex-start"
        >
          {STATUSES.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: STATUS_COLORS[status].bg,
                    border: `1px solid ${STATUS_COLORS[status].border}`,
                    boxShadow: "0 10px 24px rgba(148, 163, 184, 0.35)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <Typography variant="h6">
                      {statusLabel(status)}
                    </Typography>
                    <Chip
                      label={`${tasksByStatus[status].length} tasks`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  {/* Admin-only quick add always creates TODO tasks (leftmost column) */}
                  {isAdmin && status === "TODO" && (
                    <Card
                      variant="outlined"
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        borderColor: "rgba(148, 163, 184, 0.5)",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          Quick add task
                        </Typography>
                        <TaskQuickAdd onAdd={handleCreateTask} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Tasks list for this status */}
                  {tasksByStatus[status].map((t, index) => (
                    <Draggable
                      key={t.id}
                      draggableId={String(t.id)}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{
                            mb: 1.5,
                            borderRadius: 2,
                            boxShadow:
                              "0 8px 18px rgba(148, 163, 184, 0.45)",
                            background:
                              t.approvedReopened
                                ? "linear-gradient(135deg, #fef9c3, #fde68a)"
                                : t.priority === "HIGH"
                                ? "linear-gradient(135deg, #fee2e2, #fecaca)"
                                : t.priority === "LOW"
                                ? "linear-gradient(135deg, #dbeafe, #bfdbfe)"
                                : "linear-gradient(135deg, #ffedd5, #fed7aa)",
                            border:
                              t.approvedReopened
                                ? "1px solid #eab308"
                                : t.priority === "HIGH"
                                ? "1px solid #e11d48"
                                : t.priority === "LOW"
                                ? "1px solid #2563eb"
                                : "1px solid #ea580c",
                          }}
                        >
                          <CardContent sx={{ p: 1.5 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mb: 0.5,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                sx={{ mr: 1 }}
                              >
                                {t.title}
                              </Typography>

                              {/* Priority chip: HIGH=red, MEDIUM=orange, LOW=blue */}
                              <Chip
                                label={(t.priority || "MEDIUM").toLowerCase()}
                                size="medium"
                                sx={{
                                  textTransform: "uppercase",
                                  fontWeight: 700,
                                  fontSize: "0.7rem",
                                  px: 1.5,
                                  py: 0.4,
                                  borderRadius: 999,
                                  bgcolor:
                                    t.priority === "HIGH"
                                      ? "#fee2e2"
                                      : t.priority === "LOW"
                                      ? "#dbeafe"
                                      : "#ffedd5",
                                  color:
                                    t.priority === "HIGH"
                                      ? "#e20e0e"
                                      : t.priority === "LOW"
                                      ? "#1d4ed8"
                                      : "#c2410c",
                                  boxShadow:
                                    "0 0 0 1px rgba(148,163,184,0.4)",
                                }}
                              />
                            </Box>

                            {t.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                              >
                                {t.description}
                              </Typography>
                            )}

                            <Typography variant="caption" display="block">
                              Status: {statusLabel(t.status)}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Assigned:{" "}
                              {t.assignedAt
                                ? new Date(t.assignedAt).toLocaleString()
                                : "-"}
                            </Typography>
                            <Typography variant="caption" display="block">
                              Deadline:{" "}
                              {t.deadline
                                ? new Date(t.deadline).toLocaleString()
                                : "-"}
                            </Typography>

                            {/* completion / reopen remark */}
                            {t.completionRemark && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                {t.approvedReopened
                                  ? "Task Reopened Reason: "
                                  : "User remark: "}
                                {t.completionRemark}
                              </Typography>
                            )}

                            {/* extra chip for reopened */}
                            {t.approvedReopened && (
                              <Chip
                                label="Reopened after approval"
                                color="warning"
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}

                            {/* approval chips */}
                            {t.approvalStatus === "PENDING_REVIEW" && (
                              <Chip
                                label="Waiting admin approval"
                                color="warning"
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                            {t.approvalStatus === "APPROVED" && (
                              <Chip
                                label="Task completed"
                                color="success"
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                            {t.approvalStatus === "REJECTED" && (
                              <Chip
                                label="Completion rejected"
                                color="error"
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}

                            {/* Admin remarks */}
                            {t.adminApprovalRemark && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="success.main"
                                sx={{ mt: 0.5 }}
                              >
                                Admin remark: {t.adminApprovalRemark}
                              </Typography>
                            )}

                            {t.adminRejectionRemark && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="error.main"
                                sx={{ mt: 0.5 }}
                              >
                                Admin remark: {t.adminRejectionRemark}
                              </Typography>
                            )}

                            {t.approvalStatus === "REJECTED" &&
                              t.status === "TODO" && (
                                <Chip
                                  label="Not accepted by admin as done"
                                  color="error"
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                />
                              )}

                            {/* Only the board owner can change status AND only if not approved */}
                            {activeUserId === currentUserId &&
                              t.approvalStatus !== "APPROVED" && (
                                <>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ mt: 1 }}
                                  >
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() =>
                                        handleChangeStatus(t.id, "TODO")
                                      }
                                    >
                                      To Do
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
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
                                      onClick={() => {
                                        setRemarkModeTaskId(t.id);
                                        setDoneRemark((prev) => ({
                                          ...prev,
                                          [t.id]: prev[t.id] || "",
                                        }));
                                      }}
                                    >
                                      Done
                                    </Button>
                                  </Stack>

                                  {/* Remark input when marking DONE */}
                                  {remarkModeTaskId === t.id && (
                                    <Box sx={{ mt: 1 }}>
                                      <TextField
                                        label="Completion remark (max 20 words)"
                                        value={doneRemark[t.id] || ""}
                                        onChange={(e) => {
                                          const text = e.target.value;
                                          const words = text
                                            .trim()
                                            .split(/\s+/)
                                            .filter(Boolean);
                                          if (words.length <= 20) {
                                            setDoneRemark((prev) => ({
                                              ...prev,
                                              [t.id]: text,
                                            }));
                                          }
                                        }}
                                        fullWidth
                                        size="small"
                                        multiline
                                        minRows={2}
                                      />
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ mt: 1 }}
                                      >
                                        <Button
                                          size="small"
                                          variant="contained"
                                          onClick={async () => {
                                            const remark =
                                              (doneRemark[t.id] || "").trim();
                                            await handleChangeStatus(
                                              t.id,
                                              "DONE",
                                              {
                                                completionRemark: remark,
                                              }
                                            );
                                            setRemarkModeTaskId(null);
                                          }}
                                        >
                                          Submit & mark Done
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="text"
                                          onClick={() =>
                                            setRemarkModeTaskId(null)
                                          }
                                        >
                                          Cancel
                                        </Button>
                                      </Stack>
                                    </Box>
                                  )}
                                </>
                              )}

                            {/* Priority dropdown – owner OR admin */}
                            {(activeUserId === currentUserId || isAdmin) && (
                              <FormControl
                                fullWidth
                                size="small"
                                sx={{ mt: 1 }}
                              >
                                <InputLabel>Priority</InputLabel>
                                <Select
                                  label="Priority"
                                  value={t.priority || "MEDIUM"}
                                  onChange={(e) =>
                                    handleChangePriority(
                                      t.id,
                                      e.target.value
                                    )
                                  }
                                >
                                  <MenuItem value="LOW">Low</MenuItem>
                                  <MenuItem value="MEDIUM">Medium</MenuItem>
                                  <MenuItem value="HIGH">High</MenuItem>
                                </Select>
                              </FormControl>
                            )}

                            {/* Admin-only Approve/Reject on DONE + pending */}
                            {isAdmin &&
                              t.status === "DONE" &&
                              t.approvalStatus === "PENDING_REVIEW" && (
                                <Box sx={{ mt: 1 }}>
                                  <TextField
                                    label="Admin remark"
                                    value={adminRemark[t.id] || ""}
                                    onChange={(e) =>
                                      setAdminRemark((prev) => ({
                                        ...prev,
                                        [t.id]: e.target.value,
                                      }))
                                    }
                                    fullWidth
                                    size="small"
                                    multiline
                                    minRows={2}
                                  />
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ mt: 1 }}
                                  >
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      onClick={() =>
                                        handleReviewTask(
                                          t.id,
                                          true,
                                          adminRemark[t.id] || ""
                                        )
                                      }
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      onClick={() =>
                                        handleReviewTask(
                                          t.id,
                                          false,
                                          adminRemark[t.id] || ""
                                        )
                                      }
                                    >
                                      Reject
                                    </Button>
                                  </Stack>
                                </Box>
                              )}
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}

                  {tasksByStatus[status].length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      No tasks in this column.
                    </Typography>
                  )}

                  {provided.placeholder}
                </Paper>
              )}
            </Droppable>
          ))}
        </Stack>
      </DragDropContext>

      {/* Dialog: info for user, confirm + remark for admin */}
      <Dialog
        open={lockDialogOpen}
        onClose={() => setLockDialogOpen(false)}
      >
        <DialogTitle>
          {isAdmin && lockDialogTaskId && lockDialogTargetStatus
            ? "Move approved task?"
            : "Task is locked"}
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{
              mb:
                isAdmin && lockDialogTaskId && lockDialogTargetStatus
                  ? 1
                  : 0,
            }}
          >
            {lockDialogMessage}
          </Typography>

          {isAdmin && lockDialogTaskId && lockDialogTargetStatus && (
            <TextField
              autoFocus
              fullWidth
              size="small"
              margin="dense"
              multiline
              minRows={2}
              label="Task reopen reason (max 20 words)"
              value={overrideRemark}
              onChange={(e) => {
                const text = e.target.value;
                const words = text.trim().split(/\s+/).filter(Boolean);
                if (words.length <= 20) {
                  setOverrideRemark(text);
                }
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {isAdmin && lockDialogTaskId && lockDialogTargetStatus ? (
            <>
              <Button onClick={() => setLockDialogOpen(false)}>No</Button>
              <Button
                onClick={handleLockDialogConfirm}
                color="primary"
                variant="contained"
                autoFocus
              >
                Yes
              </Button>
            </>
          ) : (
            <Button onClick={() => setLockDialogOpen(false)} autoFocus>
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// small inline component for admin to add tasks (title + description + deadline + priority)
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
        inputProps={{
          min: now,
        }}
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

export default BoardPage;
