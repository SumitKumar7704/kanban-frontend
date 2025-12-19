import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Paper, Stack, Typography, Chip } from "@mui/material";
import TaskCard from "./TaskCard";

function BoardColumn({
  status,
  statusLabel,
  color,
  tasks,
  isAdmin,
  currentUserId,
  activeUserId,
  doneRemark,
  remarkModeTaskId,
  setRemarkModeTaskId,
  setDoneRemark,
  adminRemark,
  setAdminRemark,
  onStatusChange,
  onPriorityChange,
  onReview,
  onEditClick,
  onDeleteClick,
}) {
  const isOwner = (taskUserId) => activeUserId === currentUserId; // same logic as before

  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 3,
            backgroundColor: color.bg,
            border: `1px solid ${color.border}`,
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
              label={`${tasks.length} tasks`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>

          {tasks.map((t, index) => (
            <Draggable
              key={t.id}
              draggableId={String(t.id)}
              index={index}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <TaskCard
                    task={t}
                    isOwner={isOwner()}
                    isAdmin={isAdmin}
                    doneRemark={doneRemark}
                    remarkModeTaskId={remarkModeTaskId}
                    setRemarkModeTaskId={setRemarkModeTaskId}
                    setDoneRemark={setDoneRemark}
                    adminRemark={adminRemark}
                    setAdminRemark={setAdminRemark}
                    onStatusChange={onStatusChange}
                    onPriorityChange={onPriorityChange}
                    onReview={onReview}
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                  />
                </div>
              )}
            </Draggable>
          ))}

          {tasks.length === 0 && (
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
  );
}

export default BoardColumn;
