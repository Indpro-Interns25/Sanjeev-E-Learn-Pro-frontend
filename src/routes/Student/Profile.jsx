import { useState, useContext } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Alert, Badge, Tab, Nav,
} from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import { UiContext } from '../../context/ui-context';
import DashboardLayout from '../../components/DashboardLayout';

const AVATAR_COLORS = [
  '#4F8EF7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899',
];

function AvatarPlaceholder({ name, size = 80 }) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const bg  = AVATAR_COLORS[idx];
  return (
    <div
      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mx-auto"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {(name?.[0] || 'U').toUpperCase()}
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { showToast, darkMode, toggleDarkMode } = useContext(UiContext);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || '',
    website: user?.website || '',
  });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null);
  const [pwdAlert, setPwdAlert] = useState(null);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handlePwdChange = (e) =>
    setPasswords((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileAlert(null);
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 900));
      showToast('Profile updated successfully!', 'success');
      setProfileAlert({ type: 'success', msg: 'Profile saved.' });
    } catch {
      setProfileAlert({ type: 'danger', msg: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPwdAlert(null);
    if (passwords.next !== passwords.confirm) {
      setPwdAlert({ type: 'danger', msg: 'New passwords do not match.' });
      return;
    }
    if (passwords.next.length < 8) {
      setPwdAlert({ type: 'danger', msg: 'Password must be at least 8 characters.' });
      return;
    }
    setSavingPwd(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      showToast('Password changed successfully!', 'success');
      setPwdAlert({ type: 'success', msg: 'Password updated.' });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch {
      setPwdAlert({ type: 'danger', msg: 'Failed to change password.' });
    } finally {
      setSavingPwd(false);
    }
  };

  const roleColors = { student: 'primary', instructor: 'success', admin: 'danger' };
  const roleColor  = roleColors[user?.role] || 'secondary';

  return (
    <DashboardLayout title="My Profile">
      <Container className="py-4" style={{ maxWidth: 860 }}>
        {/* Header card */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body className="p-4">
            <Row className="align-items-center g-3">
              <Col xs="auto">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    width={80}
                    height={80}
                    className="rounded-circle"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <AvatarPlaceholder name={user?.name} size={80} />
                )}
              </Col>
              <Col>
                <h4 className="mb-1 fw-bold">{user?.name || 'User'}</h4>
                <div className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                  {user?.email}
                </div>
                <Badge bg={roleColor} className="text-capitalize px-2 py-1">
                  {user?.role || 'student'}
                </Badge>
              </Col>
              <Col xs="auto" className="d-none d-md-block text-end">
                <div className="text-muted small">Member since</div>
                <div className="fw-semibold">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                    : 'N/A'}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tabs */}
        <Tab.Container defaultActiveKey="profile">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom p-0">
              <Nav variant="tabs" className="px-3 pt-2" style={{ borderBottom: 'none' }}>
                <Nav.Item>
                  <Nav.Link eventKey="profile">
                    <i className="bi bi-person me-2" />Profile
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="security">
                    <i className="bi bi-shield-lock me-2" />Security
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="preferences">
                    <i className="bi bi-sliders me-2" />Preferences
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="danger">
                    <i className="bi bi-exclamation-triangle me-2" />Account
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body className="p-4">
              <Tab.Content>
                {/* Profile Tab */}
                <Tab.Pane eventKey="profile">
                  {profileAlert && (
                    <Alert variant={profileAlert.type} onClose={() => setProfileAlert(null)} dismissible>
                      {profileAlert.msg}
                    </Alert>
                  )}
                  <Form onSubmit={handleSaveProfile}>
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Full Name</Form.Label>
                          <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Email</Form.Label>
                          <Form.Control
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Phone</Form.Label>
                          <Form.Control
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Location</Form.Label>
                          <Form.Control
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, Country"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Website / Portfolio</Form.Label>
                          <Form.Control
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://yoursite.com"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.Label className="fw-semibold">Bio</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            placeholder="Tell us a bit about yourself…"
                          />
                          <Form.Text className="text-muted">Max 300 characters</Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="mt-4">
                      <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? (
                          <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                        ) : (
                          <><i className="bi bi-check-lg me-2" />Save Changes</>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>

                {/* Security Tab */}
                <Tab.Pane eventKey="security">
                  {pwdAlert && (
                    <Alert variant={pwdAlert.type} onClose={() => setPwdAlert(null)} dismissible>
                      {pwdAlert.msg}
                    </Alert>
                  )}
                  <h6 className="fw-bold mb-3">Change Password</h6>
                  <Form onSubmit={handleSavePassword} style={{ maxWidth: 420 }}>
                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="current"
                        value={passwords.current}
                        onChange={handlePwdChange}
                        required
                        autoComplete="current-password"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="next"
                        value={passwords.next}
                        onChange={handlePwdChange}
                        minLength={8}
                        required
                        autoComplete="new-password"
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirm"
                        value={passwords.confirm}
                        onChange={handlePwdChange}
                        minLength={8}
                        required
                        autoComplete="new-password"
                      />
                    </Form.Group>
                    <Button type="submit" variant="warning" disabled={savingPwd}>
                      {savingPwd ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Updating…</>
                      ) : (
                        <><i className="bi bi-lock me-2" />Update Password</>
                      )}
                    </Button>
                  </Form>
                </Tab.Pane>

                {/* Preferences Tab */}
                <Tab.Pane eventKey="preferences">
                  <h6 className="fw-bold mb-1">Appearance</h6>
                  <p className="text-muted small mb-4">Customise how EduLearn Pro looks for you.</p>
                  <Card className="border-0 shadow-sm mb-3">
                    <Card.Body className="d-flex align-items-center justify-content-between flex-wrap gap-3 p-4">
                      <div>
                        <div className="fw-semibold mb-1">
                          <i className={`bi ${darkMode ? 'bi-moon-stars-fill text-indigo' : 'bi-sun-fill text-warning'} me-2`}
                             style={{ color: darkMode ? '#6366f1' : '#f59e0b' }} />
                          Dark Mode
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.83rem' }}>
                          {darkMode ? 'Dark theme is currently active.' : 'Light theme is currently active.'}
                        </div>
                      </div>
                      <div className="form-check form-switch mb-0" style={{ fontSize: '1.4rem' }}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="darkModeSwitch"
                          checked={darkMode}
                          onChange={toggleDarkMode}
                          style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                        />
                        <label className="form-check-label visually-hidden" htmlFor="darkModeSwitch">
                          Toggle dark mode
                        </label>
                      </div>
                    </Card.Body>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="d-flex align-items-center justify-content-between flex-wrap gap-3 p-4">
                      <div>
                        <div className="fw-semibold mb-1">
                          <i className="bi bi-bell me-2 text-primary" />
                          Notifications
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.83rem' }}>
                          Email &amp; push notifications for new lectures and updates.
                        </div>
                      </div>
                      <div className="form-check form-switch mb-0" style={{ fontSize: '1.4rem' }}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="notifSwitch"
                          defaultChecked
                          style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                          onChange={() => showToast('Notification preference saved.', 'info')}
                        />
                        <label className="form-check-label visually-hidden" htmlFor="notifSwitch">
                          Toggle notifications
                        </label>
                      </div>
                    </Card.Body>
                  </Card>
                </Tab.Pane>

                {/* Danger Zone */}
                <Tab.Pane eventKey="danger">
                  <h6 className="fw-bold mb-1 text-danger">Danger Zone</h6>
                  <p className="text-muted small mb-4">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                  <Card className="border-danger mb-3">
                    <Card.Body className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <div className="fw-semibold">Log Out</div>
                        <div className="text-muted small">End your current session.</div>
                      </div>
                      <Button variant="outline-danger" size="sm" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-2" />Log Out
                      </Button>
                    </Card.Body>
                  </Card>
                  <Card className="border-danger">
                    <Card.Body className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                      <div>
                        <div className="fw-semibold">Delete Account</div>
                        <div className="text-muted small">Permanently delete your account and all data.</div>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => showToast('Account deletion is disabled in demo mode.', 'warning')}
                      >
                        <i className="bi bi-trash me-2" />Delete Account
                      </Button>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Tab.Container>
      </Container>
    </DashboardLayout>
  );
}
