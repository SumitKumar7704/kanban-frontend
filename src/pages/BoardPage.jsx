import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
} from "@mui/material";
import KanbanBoard from "../components/KanbanBoard";
import Dialogs from "../components/Dialogs";
import TaskQuickAdd from "../components/TaskQuickAdd";

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

  const [columns, setColumns] = useState([]); // physical columns from backend
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
  const [overrideRemark, setOverrideRemark] = useState("");

  // Admin edit/delete dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);

  const loadColumns = useCallback(async () => {
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
  }, [activeUserId, boardId]);

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
          priority, // backend defaults to MEDIUM if null
        },
        {
          params: {
            creatorId: currentUserId, // admin id
            userId: activeUserId, // board owner
            boardId,
          },
        }
      );
      await loadColumns();
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
        { status: newStatus, ...extraData },
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
          setLockDialogTaskId(null);
          setLockDialogTargetStatus(null);
          setLockDialogMessage(msg);
          setOverrideRemark("");
          setLockDialogOpen(true);
          setError("");
        }
      } else {
        setError(msg);
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
        { priority: newPriority },
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
            adminId: currentUserId,
            userId: activeUserId,
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
    if (!destination) return;
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

  // Admin edit helpers
  const openEditDialog = (task) => {
    setEditTask({
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().slice(0, 16)
        : "",
      priority: task.priority || "MEDIUM",
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editTask) return;
    setError("");
    try {
      await api.patch(
        `/tasks/${editTask.id}`,
        {
          title: editTask.title.trim(),
          description: editTask.description.trim(),
          deadline: editTask.deadline || null,
          priority: editTask.priority,
        },
        { params: { userId: activeUserId } }
      );
      await loadColumns();
      setEditDialogOpen(false);
      setEditTask(null);
    } catch (err) {
      console.error("edit task error", err.response || err);
      const raw = err.response?.data;
      const msg =
        (typeof raw === "string"
          ? raw
          : raw?.message || raw?.error || JSON.stringify(raw)) ||
        "Failed to update task";
      setError(msg);
    }
  };

  // Admin delete helpers
  const openDeleteDialog = (task) => {
    setDeleteTask(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTask) return;
    setError("");
    try {
      await api.delete(`/tasks/${deleteTask.id}`, {
        params: { userId: activeUserId, adminId: currentUserId },
      });
      await loadColumns();
      setDeleteDialogOpen(false);
      setDeleteTask(null);
    } catch (err) {
      console.error("delete task error", err.response || err);
      const raw = err.response?.data;
      const msg =
        (typeof raw === "string"
          ? raw
          : raw?.message || raw?.error || JSON.stringify(raw)) ||
        "Failed to delete task";
      setError(msg);
    }
  };

  useEffect(() => {
    loadColumns();
  }, [loadColumns]);

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

      {/* Admin-only quick add helper */}
      {isAdmin && (
        <Paper
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 2,
            borderColor: "rgba(148, 163, 184, 0.5)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 1.5 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Quick add task (TODO)
              </Typography>
              <TaskQuickAdd onAdd={handleCreateTask} />
            </CardContent>
          </Card>
        </Paper>
      )}

      {/* Board + drag-and-drop */}
      <KanbanBoard
        tasksByStatus={tasksByStatus}
        statusLabel={statusLabel}
        statusColors={STATUS_COLORS}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        activeUserId={activeUserId}
        onDragEnd={handleDragEnd}
        doneRemark={doneRemark}
        remarkModeTaskId={remarkModeTaskId}
        setRemarkModeTaskId={setRemarkModeTaskId}
        setDoneRemark={setDoneRemark}
        adminRemark={adminRemark}
        setAdminRemark={setAdminRemark}
        onStatusChange={handleChangeStatus}
        onPriorityChange={handleChangePriority}
        onReview={handleReviewTask}
        onEditClick={openEditDialog}
        onDeleteClick={openDeleteDialog}
      />

      {/* All dialogs in a single component */}
      <Dialogs
        // lock dialog
        isAdmin={isAdmin}
        lockDialogOpen={lockDialogOpen}
        lockDialogMessage={lockDialogMessage}
        lockDialogTaskId={lockDialogTaskId}
        lockDialogTargetStatus={lockDialogTargetStatus}
        overrideRemark={overrideRemark}
        setOverrideRemark={setOverrideRemark}
        onLockClose={() => setLockDialogOpen(false)}
        onLockConfirm={handleLockDialogConfirm}
        // edit dialog
        editDialogOpen={editDialogOpen}
        editTask={editTask}
        setEditTask={setEditTask}
        onEditCancel={() => {
          setEditDialogOpen(false);
          setEditTask(null);
        }}
        onEditSave={handleEditSave}
        // delete dialog
        deleteDialogOpen={deleteDialogOpen}
        deleteTask={deleteTask}
        onDeleteCancel={() => {
          setDeleteDialogOpen(false);
          setDeleteTask(null);
        }}
        onDeleteConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}

export default BoardPage;
