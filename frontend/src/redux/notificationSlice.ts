import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
    fetchNotifications as fetchNotificationsAPI,
    markNotificationAsRead as markNotificationAsReadAPI,
    markAllNotificationsAsRead as markAllNotificationsAsReadAPI,
} from '../lib/notificationService';

// تعريف الواجهة للإشعار
interface Notification {
    _id: string;
    userId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

// تعريف الحالة الأولية
interface NotificationState {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
}

// الحالة الأولية
const initialState: NotificationState = {
    notifications: [],
    loading: false,
    error: null,
};

// أكشن لجلب الإشعارات من الباك
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (userId: string, { rejectWithValue }) => {
        try {
            const data = await fetchNotificationsAPI(userId);
            return data;
        } catch (error) {
            return rejectWithValue('Failed to fetch notifications');
        }
    }
);

// أكشن لعلامة الإشعار كمقروء
export const markNotificationAsRead = createAsyncThunk(
    'notifications/markNotificationAsRead',
    async (id: string, { rejectWithValue }) => {
        try {
            await markNotificationAsReadAPI(id);
            return id;
        } catch (error) {
            return rejectWithValue('Failed to mark notification as read');
        }
    }
);

// أكشن لتحديد كل الإشعارات كمقروءة
export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (userId: string, { rejectWithValue }) => {
        try {
            await markAllNotificationsAsReadAPI(userId);
            return userId;
        } catch (error) {
            return rejectWithValue('Failed to mark all as read');
        }
    }
);

// Slice
const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<Notification[]>) => {
            state.notifications = action.payload;
        },
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload); // إضافة الإشعار الجديد
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.notifications = action.payload;
                state.loading = false;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n._id === action.payload);
                if (notification) {
                    notification.isRead = true;
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
            });
    },
});

export const { setNotifications, addNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
