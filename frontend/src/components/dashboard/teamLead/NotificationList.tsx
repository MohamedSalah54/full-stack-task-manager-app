'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { fetchNotifications } from '@/redux/notificationSlice';
import { List, ListItem, ListItemText, Divider, Typography } from '@mui/material';

const NotificationList = () => {
  const dispatch = useAppDispatch();

  const userId = useAppSelector((state) => state.auth.user?.id);
  const notifications = useAppSelector((state) => state.notifications.notifications);
  const loading = useAppSelector((state) => state.notifications.loading);
  const error = useAppSelector((state) => state.notifications.error);

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId));
    }
  }, [userId, dispatch]);

  const latestNotifications = notifications.slice(0, 5);

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Recent Notifications
      </Typography>

      {loading && <Typography>Loading notifications...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && latestNotifications.length === 0 && (
        <Typography>No notifications found.</Typography>
      )}

      <List>
        {latestNotifications.map((notif) => (
          <div key={notif._id}>
            <ListItem>
              <ListItemText
                primary={notif.message}
                secondary={new Date(notif.date).toLocaleString()} // استخدم date بدلاً من createdAt
              />
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>
    </div>
  );
};

export default NotificationList;
