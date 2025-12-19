import { useState } from "react";
import {
  Box,
  Avatar,
  Grid,
  Typography,
  Button,
} from "@mui/material";

const PRESET_AVATARS = Array.from({ length: 16 }).map(
  (_, i) => `/avatars/avatar${i + 1}.jpg`
);

function AvatarPicker({ value, onChange, onUpload }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    try {
      setUploading(true);
      const url = await onUpload(file); // backend returns final URL
      onChange(url);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Choose an avatar
      </Typography>

      <Grid container spacing={1}>
        {PRESET_AVATARS.map((src) => (
          <Grid item xs={3} key={src}>
            <Avatar
              src={src}
              sx={{
                width: 48,
                height: 48,
                cursor: "pointer",
                border:
                  value === src
                    ? "2px solid #2563eb"
                    : "2px solid transparent",
              }}
              onClick={() => onChange(src)}
            />
          </Grid>
        ))}
      </Grid>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2, mb: 1 }}
      >
        Or upload your own
      </Typography>

      <Button
        variant="outlined"
        component="label"
        size="small"
        disabled={uploading || !onUpload}
      >
        {uploading ? "Uploading..." : "Upload image"}
        <input
          hidden
          accept="image/*"
          type="file"
          onChange={handleFileChange}
        />
      </Button>
    </Box>
  );
}

export default AvatarPicker;
