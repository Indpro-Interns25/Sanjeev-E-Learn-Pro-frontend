import { useEffect, useMemo, useRef, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useChatContext } from '../../context/ChatContext';
import { isValidChatMessage, isPlainObject } from '../../utils/socketGuards';

const JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';
const JITSI_API_SRC = `https://${JITSI_DOMAIN}/external_api.js`;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-jitsi-src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.dataset.jitsiSrc = src;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });
}

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || 'U';
}

export default function LiveClassRoom() {
  const { classId } = useParams();
  const { user } = useAuth();
  const { socket: socketRef } = useChatContext();

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [meetingReady, setMeetingReady] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const roomId = useMemo(() => `live_${classId}`, [classId]);
  const meetingName = useMemo(() => `EduLearn-${classId}`, [classId]);
  const bottomRef = useRef(null);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    const socket = socketRef?.current;

    setParticipants([
      { id: String(user?.id || 'self'), name: user?.name || 'You', role: user?.role || 'student', online: true },
    ]);

    if (!socket) return;

    socket.emit('live:join', { roomId, userId: user?.id, name: user?.name, role: user?.role });

    const onPresence = (payload) => {
      if (!isPlainObject(payload) || payload.roomId !== roomId || !Array.isArray(payload.participants)) return;
      setParticipants(payload.participants.filter((participant) => isPlainObject(participant)));
    };

    const onMessage = (payload) => {
      if (!isValidChatMessage(payload) || payload.roomId !== roomId) return;
      setMessages((prev) => [...prev, payload]);
    };

    socket.on('live:participants', onPresence);
    socket.on('live:message', onMessage);

    return () => {
      socket.emit('live:leave', { roomId, userId: user?.id });
      socket.off('live:participants', onPresence);
      socket.off('live:message', onMessage);
    };
  }, [roomId, socketRef, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    let cleanupFn = null;

    const startMeeting = async () => {
      setApiError(null);
      try {
        await loadScript(JITSI_API_SRC);
        if (cancelled || !jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return;

        const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: meetingName,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: user?.name || 'Learner',
            email: user?.email || '',
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_CHROME_EXTENSION_BANNER: false,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
          },
        });

        jitsiApiRef.current = api;
        setMeetingReady(true);

        const syncParticipants = async () => {
          try {
            const raw = await api.getParticipantsInfo();
            const mapped = Array.isArray(raw)
              ? raw.map((participant) => ({
                id: String(participant.participantId || participant.id || participant.displayName || Math.random()),
                name: participant.displayName || participant.formattedDisplayName || 'Participant',
                role: participant.role || 'student',
                online: true,
              }))
              : [];
            setParticipants([
              { id: String(user?.id || 'self'), name: user?.name || 'You', role: user?.role || 'student', online: true },
              ...mapped,
            ]);
          } catch {
            // Keep the local participant list when the API does not expose roster data.
          }
        };

        api.addListener('videoConferenceJoined', () => {
          syncParticipants();
        });

        api.addListener('participantJoined', (participant) => {
          if (!isPlainObject(participant)) return;
          setParticipants((prev) => {
            const next = [
              ...prev,
              {
                id: String(participant.id || participant.participantId || participant.displayName || Date.now()),
                name: participant.displayName || 'Participant',
                role: 'student',
                online: true,
              },
            ];
            return next.filter((value, index, array) => index === array.findIndex((item) => item.id === value.id));
          });
        });

        api.addListener('participantLeft', (participant) => {
          if (!isPlainObject(participant)) return;
          const participantId = String(participant.id || participant.participantId || participant.displayName || '');
          setParticipants((prev) => prev.filter((value) => value.id !== participantId));
        });

        api.addListener('audioMuteStatusChanged', ({ muted }) => {
          setIsMuted(Boolean(muted));
        });

        api.addListener('videoMuteStatusChanged', ({ muted }) => {
          setIsVideoOff(Boolean(muted));
        });

        api.executeCommand('displayName', user?.name || 'Learner');

        cleanupFn = () => {
          api.dispose();
          jitsiApiRef.current = null;
          setMeetingReady(false);
        };
      } catch (error) {
        if (!cancelled) {
          setApiError('Live class could not load. Falling back to direct meeting link.');
        }
      }
    };

    startMeeting();

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
  }, [meetingName, user]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const payload = {
      id: Date.now(),
      roomId,
      userId: user?.id,
      name: user?.name || 'You',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, payload]);
    socketRef?.current?.emit('live:send', payload);
    setInput('');
  };

  const toggleMic = () => {
    const api = jitsiApiRef.current;
    if (api?.executeCommand) {
      api.executeCommand('toggleAudio');
      return;
    }
    setIsMuted((value) => !value);
  };

  const toggleCamera = () => {
    const api = jitsiApiRef.current;
    if (api?.executeCommand) {
      api.executeCommand('toggleVideo');
      return;
    }
    setIsVideoOff((value) => !value);
  };

  const meetingUrl = `https://${JITSI_DOMAIN}/${encodeURIComponent(meetingName)}#userInfo.displayName="${encodeURIComponent(user?.name || 'Learner')}"`;

  return (
    <DashboardLayout title="Live Class Room">
      <Container fluid className="py-3">
        <Row className="g-3">
          <Col xl={9}>
            <Card className="border-0 shadow-sm overflow-hidden">
              <Card.Header className="bg-dark text-light d-flex justify-content-between align-items-center">
                <div>
                  <strong>Live Class {classId}</strong>
                  <div className="small text-light opacity-75">Room: {meetingName}</div>
                </div>
                <div className="d-flex gap-2">
                  <Badge bg={isVideoOff ? 'secondary' : 'success'}>{isVideoOff ? 'Camera Off' : 'Camera On'}</Badge>
                  <Badge bg={isMuted ? 'secondary' : 'success'}>{isMuted ? 'Mic Off' : 'Mic On'}</Badge>
                  <Badge bg={meetingReady ? 'success' : 'warning'}>{meetingReady ? 'Connected' : 'Connecting'}</Badge>
                </div>
              </Card.Header>

              {apiError && (
                <Alert variant="warning" className="m-3 mb-0">
                  {apiError} <a href={meetingUrl} target="_blank" rel="noreferrer">Open meeting directly</a>
                </Alert>
              )}

              <div style={{ height: '70vh', minHeight: 480, background: '#0b1220' }}>
                <div ref={jitsiContainerRef} style={{ width: '100%', height: '100%' }} />
                {!meetingReady && !apiError && (
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 text-white">
                    <Spinner animation="border" className="mb-3" />
                    <div>Loading live class...</div>
                  </div>
                )}
              </div>

              <Card.Footer className="bg-white d-flex flex-wrap gap-2">
                <Button variant={isMuted ? 'danger' : 'outline-danger'} onClick={toggleMic}>
                  <i className={`bi ${isMuted ? 'bi-mic' : 'bi-mic-mute'} me-1`} />
                  {isMuted ? 'Unmute Mic' : 'Mute Mic'}
                </Button>
                <Button variant={isVideoOff ? 'danger' : 'outline-danger'} onClick={toggleCamera}>
                  <i className={`bi ${isVideoOff ? 'bi-camera-video' : 'bi-camera-video-off'} me-1`} />
                  {isVideoOff ? 'Start Camera' : 'Stop Camera'}
                </Button>
              </Card.Footer>
            </Card>
          </Col>

          <Col xl={3}>
            <Card className="border-0 shadow-sm mb-3">
              <Card.Header className="bg-white fw-semibold d-flex justify-content-between align-items-center">
                Participants
                <Badge bg="info">{participants.length}</Badge>
              </Card.Header>
              <Card.Body style={{ maxHeight: 260, overflowY: 'auto' }}>
                {participants.length === 0 ? (
                  <div className="text-muted small">No participants yet.</div>
                ) : participants.map((p) => (
                  <div key={p.id} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 30, height: 30, fontSize: 12 }}>
                        {initials(p.name)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem' }}>{p.name}</div>
                        <small className="text-muted text-capitalize">{p.role || 'student'}</small>
                      </div>
                    </div>
                    <span className="text-success" title="Online">
                      <i className="bi bi-circle-fill" style={{ fontSize: '0.55rem' }} />
                    </span>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white fw-semibold">Live Chat</Card.Header>
              <Card.Body style={{ height: 260, overflowY: 'auto' }}>
                {messages.length === 0 ? (
                  <div className="text-muted small">No messages yet.</div>
                ) : messages.map((m) => (
                  <div key={m.id} className="mb-2">
                    <small className="fw-semibold d-block">{m.name}</small>
                    <div className="small text-muted">{m.text}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </Card.Body>
              <Card.Footer className="bg-white">
                <Form onSubmit={handleSend}>
                  <InputGroup>
                    <Form.Control
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Message class..."
                      maxLength={300}
                    />
                    <Button type="submit" variant="primary" disabled={!input.trim()}>
                      Send
                    </Button>
                  </InputGroup>
                </Form>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}
