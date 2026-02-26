import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Badge,
  InputGroup,
  Spinner,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import { useChatContext } from '../../context/ChatContext';
import { getCourseById } from '../../data/mockCourses';

// ─── helpers ─────────────────────────────────────────────────────────────────
function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function avatarInitials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function hashColor(name = '') {
  const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

// ─── mock messages (shown while socket is connecting / unavailable) ───────────
function makeMockMessages(courseId) {
  return [
    { id: 1, userId: 0, userName: 'Alice', text: `Welcome to the course ${courseId} chat! 👋`, createdAt: new Date(Date.now() - 120000).toISOString() },
    { id: 2, userId: 0, userName: 'Bob', text: 'Has anyone finished Module 2 yet?', createdAt: new Date(Date.now() - 60000).toISOString() },
    { id: 3, userId: 0, userName: 'Alice', text: 'Yes! The project part was tricky but fun.', createdAt: new Date(Date.now() - 30000).toISOString() },
  ];
}

// ─── component ────────────────────────────────────────────────────────────────
export default function CourseChat() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket: socketRef, onlineUsers, clearUnread, setCurrentRoom } = useChatContext();

  const [course, setCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const roomId = `course_${courseId}`;

  // ── Load course info ─────────────────────────────────────────────────────
  useEffect(() => {
    const data = getCourseById(parseInt(courseId));
    setCourse(data || { title: `Course ${courseId}` });
  }, [courseId]);

  // ── Socket setup & room join ─────────────────────────────────────────────
  useEffect(() => {
    clearUnread();
    setCurrentRoom(roomId);

    const socket = socketRef?.current;

    // Pre-populate with mock messages so the UI isn't empty
    setMessages(makeMockMessages(courseId));

    if (!socket) return;

    socket.emit('chat:join', { roomId, userId: user?.id, userName: user?.name });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const onOnline = ({ count }) => setOnlineCount(count);
    const onHistory = (history) => setMessages(history);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(`chat:message:${roomId}`, onMessage);
    socket.on(`chat:online:${roomId}`, onOnline);
    socket.on(`chat:history:${roomId}`, onHistory);

    if (socket.connected) setConnected(true);

    return () => {
      socket.emit('chat:leave', { roomId, userId: user?.id });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(`chat:message:${roomId}`, onMessage);
      socket.off(`chat:online:${roomId}`, onOnline);
      socket.off(`chat:history:${roomId}`, onHistory);
      setCurrentRoom(null);
    };
  }, [courseId, roomId, socketRef, user, clearUnread, setCurrentRoom]);

  // ── Sync online count from context ───────────────────────────────────────
  useEffect(() => {
    if (onlineUsers[courseId]) setOnlineCount(onlineUsers[courseId]);
  }, [onlineUsers, courseId]);

  // ── Auto-scroll to bottom ────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (e) => {
    e?.preventDefault();
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    const msg = {
      id: Date.now(),
      userId: user?.id,
      userName: user?.name || 'You',
      text,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, msg]);
    setInputText('');

    const socket = socketRef?.current;
    if (socket?.connected) {
      socket.emit('chat:send', { roomId, userId: user?.id, userName: user?.name, text });
    }

    setSending(false);
  }, [inputText, sending, user, socketRef, roomId]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Course Chat">
    <Container className="py-4" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <Button variant="link" className="p-0 text-decoration-none me-2" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left" />
          </Button>
          <strong className="h5 mb-0">{course?.title ?? '…'} — Chat Room</strong>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg={connected ? 'success' : 'secondary'} pill>
            <i className="bi bi-wifi me-1" />{connected ? 'Live' : 'Offline'}
          </Badge>
          <Badge bg="info" text="dark" pill>
            <i className="bi bi-people me-1" />
            {onlineCount > 0 ? onlineCount : '–'} online
          </Badge>
        </div>
      </div>

      {/* Message window */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body
          className="p-3 d-flex flex-column gap-2"
          style={{ height: 460, overflowY: 'auto' }}
        >
          {messages.length === 0 && (
            <div className="text-center text-muted my-auto">
              <i className="bi bi-chat-dots display-4 d-block mb-2" />
              No messages yet. Be the first to say hi!
            </div>
          )}

          {messages.map((msg) => {
            const isOwn = msg.userId === user?.id;
            const color = hashColor(msg.userName);
            return (
              <div
                key={msg.id}
                className={`d-flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                {!isOwn && (
                  <div
                    className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ width: 36, height: 36, background: color, fontSize: 13 }}
                  >
                    {avatarInitials(msg.userName)}
                  </div>
                )}

                {/* Bubble */}
                <div style={{ maxWidth: '75%' }}>
                  {!isOwn && (
                    <small className="text-muted d-block mb-1 ms-1">{msg.userName}</small>
                  )}
                  <div
                    className={`px-3 py-2 rounded-3 ${
                      isOwn
                        ? 'bg-primary text-white'
                        : 'bg-light text-dark'
                    } ${msg.pending ? 'opacity-75' : ''}`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {msg.text}
                    {msg.pending && (
                      <Spinner animation="border" size="sm" className="ms-2 opacity-50" style={{ width: 10, height: 10 }} />
                    )}
                  </div>
                  <small className={`text-muted d-block mt-1 ${isOwn ? 'text-end' : ''}`} style={{ fontSize: '0.7rem' }}>
                    {formatTime(msg.createdAt)}
                  </small>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </Card.Body>
      </Card>

      {/* Input */}
      <Form onSubmit={sendMessage}>
        <InputGroup>
          <Form.Control
            placeholder="Type a message… (Enter to send)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKey}
            disabled={sending}
            maxLength={500}
            className="rounded-start-3"
            style={{ resize: 'none' }}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={!inputText.trim() || sending}
            className="rounded-end-3"
          >
            {sending
              ? <Spinner animation="border" size="sm" />
              : <><i className="bi bi-send me-1" />Send</>
            }
          </Button>
        </InputGroup>
        <small className="text-muted mt-1 d-block">
          {!connected && <><i className="bi bi-exclamation-circle me-1 text-warning" />Disconnected from live chat — messages will send when reconnected.</>}
        </small>
      </Form>
    </Container>
    </DashboardLayout>
  );
}
