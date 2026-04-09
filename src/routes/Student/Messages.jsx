import { useMemo, useState } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, InputGroup, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useChatContext } from '../../context/ChatContext';

const contacts = [
  { id: 'inst_1', name: 'Ava Instructor', role: 'instructor', online: true },
  { id: 'peer_1', name: 'Rahul Student', role: 'student', online: false },
  { id: 'peer_2', name: 'Neha Student', role: 'student', online: true },
];

export default function Messages() {
  const { user } = useAuth();
  const { socket: socketRef } = useChatContext();
  const [activeTab, setActiveTab] = useState('direct');
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [directMessages, setDirectMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [text, setText] = useState('');

  const currentFeed = useMemo(() => activeTab === 'direct' ? directMessages : groupMessages, [activeTab, directMessages, groupMessages]);

  const send = (e) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;

    const msg = {
      id: Date.now(),
      text: value,
      sender: user?.name || 'You',
      createdAt: new Date().toISOString(),
      roomId: activeTab === 'direct' ? `dm_${activeContact.id}` : 'group_lms',
      type: activeTab,
    };

    if (activeTab === 'direct') {
      setDirectMessages((prev) => [...prev, msg]);
      socketRef?.current?.emit('chat:direct', {
        toUserId: activeContact.id,
        text: value,
      });
    } else {
      setGroupMessages((prev) => [...prev, msg]);
      socketRef?.current?.emit('chat:send', {
        roomId: 'group_lms',
        userId: user?.id,
        userName: user?.name,
        text: value,
      });
    }

    setText('');
  };

  return (
    <DashboardLayout title="Messages">
      <Container className="py-4">
        <Row className="g-3">
          <Col lg={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white fw-semibold">Contacts</Card.Header>
              <ListGroup variant="flush">
                {contacts.map((contact) => (
                  <ListGroup.Item
                    key={contact.id}
                    action
                    active={contact.id === activeContact.id}
                    onClick={() => setActiveContact(contact)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-semibold">{contact.name}</div>
                      <small className={contact.online ? 'text-success' : 'text-muted'}>
                        <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }} />
                        {contact.online ? 'Online' : 'Offline'}
                      </small>
                    </div>
                    <Badge bg={contact.role === 'instructor' ? 'success' : 'primary'}>{contact.role}</Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'direct')}>
                  <Tab eventKey="direct" title="One-to-One" />
                  <Tab eventKey="group" title="Group Chat" />
                </Tabs>
              </Card.Header>
              <Card.Body style={{ minHeight: 340, maxHeight: 340, overflowY: 'auto' }}>
                {currentFeed.length === 0 ? (
                  <div className="text-muted">No messages yet.</div>
                ) : currentFeed.map((m) => (
                  <div key={m.id} className="mb-2">
                    <small className="fw-semibold d-block">{m.sender}</small>
                    <div className="small text-muted">{m.text}</div>
                  </div>
                ))}
              </Card.Body>
              <Card.Footer className="bg-white">
                <Form onSubmit={send}>
                  <InputGroup>
                    <Form.Control
                      placeholder={activeTab === 'direct' ? `Message ${activeContact.name}...` : 'Message group...'}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={500}
                    />
                    <Button type="submit" variant="primary" disabled={!text.trim()}>Send</Button>
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
