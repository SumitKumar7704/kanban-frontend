import { Avatar, Box, Stack, Typography } from "@mui/material";

function UserCard({ name, username, email, profilePictureUrl }) {
  const fallbackInitial =
    (name && name.trim()[0]) ||
    (username && username.trim()[0]) ||
    "U";

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(148,163,184,0.4)",
        backgroundColor: "rgba(255,255,255,0.9)",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          src={profilePictureUrl || ""}
          alt={name || username || "User"}
          sx={{ width: 56, height: 56 }}
        >
          {fallbackInitial.toUpperCase()}
        </Avatar>

        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {name || "Unnamed user"}
          </Typography>
          {username && (
            <Typography variant="body2" color="text.secondary">
              @{username}
            </Typography>
          )}
          {email && (
            <Typography variant="body2" color="text.secondary">
              {email}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default UserCard;
