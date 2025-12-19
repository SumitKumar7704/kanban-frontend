import PrioritySelect from "./PrioritySelect";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

function TaskCard({
  task: t,
  isOwner,
  isAdmin,
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
  return (
    <Card
      sx={{
        mb: 1.5,
        borderRadius: 2,
        boxShadow: "0 8px 18px rgba(148, 163, 184, 0.45)",
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
              boxShadow: "0 0 0 1px rgba(148,163,184,0.4)",
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
          Status:{" "}
          {t.status === "TODO"
            ? "To Do"
            : t.status === "IN_PROGRESS"
            ? "In Progress"
            : "Done"}
        </Typography>
        <Typography variant="caption" display="block">
          Assigned:{" "}
          {t.assignedAt ? new Date(t.assignedAt).toLocaleString() : "-"}
        </Typography>
        <Typography variant="caption" display="block">
          Deadline:{" "}
          {t.deadline ? new Date(t.deadline).toLocaleString() : "-"}
        </Typography>

        {t.completionRemark && (
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {t.approvedReopened ? "Task Reopened Reason: " : "User remark: "}
            {t.completionRemark}
          </Typography>
        )}

        {t.approvedReopened && (
          <Chip
            label="Reopened after approval"
            color="warning"
            size="small"
            sx={{ mt: 0.5 }}
          />
        )}

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

        {t.approvalStatus === "REJECTED" && t.status === "TODO" && (
          <Chip
            label="Not accepted by admin as done"
            color="error"
            size="small"
            sx={{ mt: 0.5 }}
          />
        )}

        {/* owner-only status change */}
        {isOwner && t.approvalStatus !== "APPROVED" && (
          <>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onStatusChange(t.id, "TODO")}
              >
                To Do
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onStatusChange(t.id, "IN_PROGRESS")}
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

            {remarkModeTaskId === t.id && (
              <Box sx={{ mt: 1 }}>
                <TextField
                  label="Completion remark (max 20 words)"
                  value={doneRemark[t.id] || ""}
                  onChange={(e) => {
                    const text = e.target.value;
                    const words = text.trim().split(/\s+/).filter(Boolean);
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
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={async () => {
                      const remark = (doneRemark[t.id] || "").trim();
                      await onStatusChange(t.id, "DONE", {
                        completionRemark: remark,
                      });
                      setRemarkModeTaskId(null);
                    }}
                  >
                    Submit & mark Done
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setRemarkModeTaskId(null)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            )}
          </>
        )}

        {/* Priority – owner or admin */}
        {(isOwner || isAdmin) && (
          <PrioritySelect
            value={t.priority}
            onChange={(newPriority) => onPriorityChange(t.id, newPriority)}
            sx={{ mt: 1 }}
          />
        )}

        {/* Admin review */}
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
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() =>
                    onReview(t.id, true, adminRemark[t.id] || "")
                  }
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    onReview(t.id, false, adminRemark[t.id] || "")
                  }
                >
                  Reject
                </Button>
              </Stack>
            </Box>
          )}

        {/* Admin edit/delete */}
        {isAdmin && (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onEditClick(t)}
            >
              Edit
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onDeleteClick(t)}
            >
              Delete
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default TaskCard;
