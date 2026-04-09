import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { getAccessToken } from '../utils/tokenStorage';
import { isValidChatMessage, isValidRoomId } from '../utils/socketGuards';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

const ChatContext = createContext({
  unreadCount: 0,
  clearUnread: () => {},
  socket: null,
  onlineUsers: {},
});

export function ChatProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState({}); // courseId → count
  const currentRoomRef = useRef(null);
  const seenMessageIdsRef = useRef(new Set());

  // Connect socket only when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = io(SOCKET_URL, {
      auth: { token: getAccessToken() },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.info('🔌 Chat socket connected:', socket.id);
      if (isValidRoomId(currentRoomRef.current)) {
        socket.emit('chat:join', { roomId: currentRoomRef.current, userId: user?.id, userName: user?.name });
      }
    });

    socket.on('disconnect', () => {
      console.info('🔌 Chat socket disconnected');
    });

    // Global unread counter: increment when a message arrives in a room we're not viewing
    socket.on('chat:message', (msg) => {
      if (!isValidChatMessage(msg)) return;
      if (msg.id && seenMessageIdsRef.current.has(msg.id)) return;
      if (msg.id) {
        seenMessageIdsRef.current.add(msg.id);
        if (seenMessageIdsRef.current.size > 200) {
          seenMessageIdsRef.current = new Set(Array.from(seenMessageIdsRef.current).slice(-100));
        }
      }
      if (msg.roomId !== currentRoomRef.current) {
        setUnreadCount((n) => n + 1);
      }
    });

    socket.on('chat:online_users', ({ courseId, count }) => {
      setOnlineUsers((prev) => ({ ...prev, [courseId]: count }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const setCurrentRoom = useCallback((roomId) => {
    currentRoomRef.current = roomId;
    seenMessageIdsRef.current.clear();
    if (isValidRoomId(roomId) && socketRef.current?.connected) {
      socketRef.current.emit('chat:join', { roomId, userId: user?.id, userName: user?.name });
    }
  }, [user]);

  return (
    <ChatContext.Provider value={{ unreadCount, clearUnread, socket: socketRef, onlineUsers, setCurrentRoom }}>
      {children}
    </ChatContext.Provider>
  );
}

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useChatContext() {
  return useContext(ChatContext);
}
