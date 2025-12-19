import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

function PrioritySelect({
  value,
  onChange,
  disabled = false,
  sx,
}) {
  return (
    <FormControl
      fullWidth
      size="small"
      sx={sx}
      disabled={disabled}
    >
      <InputLabel>Priority</InputLabel>
      <Select
        label="Priority"
        value={value || "MEDIUM"}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="LOW">Low</MenuItem>
        <MenuItem value="MEDIUM">Medium</MenuItem>
        <MenuItem value="HIGH">High</MenuItem>
      </Select>
    </FormControl>
  );
}

export default PrioritySelect;
