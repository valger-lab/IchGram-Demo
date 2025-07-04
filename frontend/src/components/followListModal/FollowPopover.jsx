import {
  Avatar,
  Box,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Popover,
  Typography,
  Slide,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../api/axiosInstance";

const API_BASE = "http://localhost:3000";

export default function FollowPopover({
  anchorEl,
  open,
  onClose,
  title,
  users = [],
}) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const fetchUser = async () => {
      try {
        const res = await axios.get("/users/me");
        setCurrentUserId(res.data._id);
      } catch (err) {
        console.error("Ошибка при получении текущего пользователя:", err);
      }
    };
    fetchUser();
  }, [open]);

  const handleClick = (userId) => {
    if (!currentUserId) return;
    if (userId === currentUserId) {
      navigate("/profile");
    } else {
      navigate(`/users/${userId}`);
    }
    onClose();
  };

  useEffect(() => {
    if (!open && anchorEl) {
      anchorEl.focus();
    }
  }, [open, anchorEl]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: 10, left: window.innerWidth }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: "left", timeout: 300 }} // ← вылетает справа налево
      PaperProps={{
        sx: {
          width: { xs: "50vw", sm: 220 },
          maxHeight: "70vh",
          boxShadow: 4,
          overflowY: "auto",
          borderRadius: 2,
          backgroundColor: "#a5dbff",
          color: "#100303",
          p: 2,
        },
      }}
    >
      <Box sx={{ p: 2, width: 200, maxHeight: 200, overflowY: "auto" }}>
        <Typography variant="h7" sx={{ mb: 1, marginLeft: 2 }}>
          {title}
        </Typography>
        <List>
          {users.length > 0 ? (
            users.map((user) => (
              <ListItemButton
                key={user._id}
                onClick={() => handleClick(user._id)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={
                      user.avatar.startsWith("http")
                        ? user.avatar
                        : `${API_BASE}/${user.avatar.replace(/^\/+/, "")}`
                    }
                    alt={user.username}
                  />
                </ListItemAvatar>
                <ListItemText primary={user.username} />
              </ListItemButton>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              no users found
            </Typography>
          )}
        </List>
      </Box>
    </Popover>
  );
}
