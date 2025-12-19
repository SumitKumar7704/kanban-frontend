import { DragDropContext } from "@hello-pangea/dnd";
import { Stack } from "@mui/material";
import BoardColumn from "./BoardColumn";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

function KanbanBoard({
  tasksByStatus,
  statusLabel,
  statusColors,
  isAdmin,
  currentUserId,
  activeUserId,
  onDragEnd,
  ...taskCardProps
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems="flex-start"
      >
        {STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            statusLabel={statusLabel}
            color={statusColors[status]}
            tasks={tasksByStatus[status]}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            activeUserId={activeUserId}
            {...taskCardProps}
          />
        ))}
      </Stack>
    </DragDropContext>
  );
}

export default KanbanBoard;
