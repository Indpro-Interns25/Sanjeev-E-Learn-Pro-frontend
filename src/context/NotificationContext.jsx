import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { useUi } from '../hooks/useUi';
import { getAccessToken } from '../utils/tokenStorage';
import { isPlainObject, isValidChatMessage } from '../utils/socketGuards';
import { SOCKET_URL } from '../config/apiConfig';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  markAsRead: () => {},
  removeNotification: () => {},
});

function createNotification(payload) {
  return {
    id: payload.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: payload.title || 'Notification',
    message: payload.message || 'You have a new update.',
    type: payload.type || 'info',
    createdAt: payload.createdAt || new Date().toISOString(),
    read: false,
    meta: payload.meta || null,
  };
}

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useUi();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const seenNotificationIdsRef = useRef(new Set());

  const pushNotification = useCallback((payload) => {
    if (!isPlainObject(payload)) return;
    const incoming = createNotification(payload);
    if (seenNotificationIdsRef.current.has(incoming.id)) return;
    seenNotificationIdsRef.current.add(incoming.id);
    if (seenNotificationIdsRef.current.size > 200) {
      seenNotificationIdsRef.current = new Set(Array.from(seenNotificationIdsRef.current).slice(-100));
    }
    setNotifications((prev) => [incoming, ...prev].slice(0, 30));
    showToast(`${incoming.title}: ${incoming.message}`, incoming.type === 'error' ? 'error' : 'info', 4500);
  }, [showToast]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token: getAccessToken() },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('notification:subscribe', { userId: user.id, role: user.role });
    });

    socket.on('notification:new', (payload) => pushNotification(payload));

    socket.on('chat:message', (payload) => {
      if (!isValidChatMessage(payload)) return;
      const targetRoom = payload.roomId || payload.courseId || 'chat';
      pushNotification({
        id: payload.id ? `chat_${payload.id}` : undefined,
        title: 'New Message',
        message: payload.text || `New message in ${targetRoom}`,
        type: 'info',
        meta: { roomId: targetRoom }
      });
    });

    socket.on('course:deadline', (payload) => {
      pushNotification({
        title: 'Upcoming Deadline',
        message: payload?.message || 'A course deadline is approaching.',
        type: 'warning',
        meta: payload,
      });
    });

    socket.on('course:new', (payload) => {
      pushNotification({
        title: 'New Course Added',
        message: payload?.title ? `${payload.title} is now available.` : 'A new course is now available.',
        type: 'success',
        meta: payload,
      });
    });

    return () => {
      socket.off('notification:new');
      socket.off('chat:message');
      socket.off('course:deadline');
      socket.off('course:new');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user, pushNotification]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markAllRead,
    markAsRead,
    removeNotification,
  }), [notifications, unreadCount, markAllRead, markAsRead, removeNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useNotifications() {
  return useContext(NotificationContext);
}
