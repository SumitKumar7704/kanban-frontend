import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";

function Dialogs({
  // lock dialog
  isAdmin,
  lockDialogOpen,
  lockDialogMessage,
  lockDialogTaskId,
  lockDialogTargetStatus,
  overrideRemark,
  setOverrideRemark,
  onLockClose,
  onLockConfirm,

  // edit dialog
  editDialogOpen,
  editTask,
  setEditTask,
  onEditCancel,
  onEditSave,

  // delete dialog
  deleteDialogOpen,
  deleteTask,
  onDeleteCancel,
  onDeleteConfirm,
}) {
  const isLockConfirmMode =
    isAdmin && lockDialogTaskId && lockDialogTargetStatus;

  return (
    <>
      {/* Lock / info dialog */}
      <Dialog open={lockDialogOpen} onClose={onLockClose}>
        <DialogTitle>
          {isLockConfirmMode ? "Move approved task?" : "Task is locked"}
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ mb: isLockConfirmMode ? 1 : 0 }}
          >
            {lockDialogMessage}
          </Typography>

          {isLockConfirmMode && (
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
          {isLockConfirmMode ? (
            <>
              <Button onClick={onLockClose}>No</Button>
              <Button
                onClick={onLockConfirm}
                color="primary"
                variant="contained"
                autoFocus
              >
                Yes
              </Button>
            </>
          ) : (
            <Button onClick={onLockClose} autoFocus>
              OK
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit task dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={onEditCancel}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit task</DialogTitle>
        <DialogContent>
          {editTask && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                fullWidth
                size="small"
                value={editTask.title}
                onChange={(e) =>
                  setEditTask((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <TextField
                label="Description"
                fullWidth
                size="small"
                multiline
                minRows={2}
                value={editTask.description}
                onChange={(e) =>
                  setEditTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <TextField
                label="Deadline"
                type="datetime-local"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={editTask.deadline}
                onChange={(e) =>
                  setEditTask((prev) => ({
                    ...prev,
                    deadline: e.target.value,
                  }))
                }
              />
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  label="Priority"
                  value={editTask.priority}
                  onChange={(e) =>
                    setEditTask((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onEditCancel}>Cancel</Button>
          <Button onClick={onEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteDialogOpen} onClose={onDeleteCancel}>
        <DialogTitle>Delete task?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {`Are you sure you want to delete "${
              deleteTask?.title || "this task"
            }"? This action cannot be undone.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onDeleteCancel}>Cancel</Button>
          <Button
            onClick={onDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Dialogs;
