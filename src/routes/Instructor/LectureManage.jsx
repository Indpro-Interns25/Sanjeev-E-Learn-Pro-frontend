/**
 * LectureManage.jsx  –  Instructor: manage lectures for a course
 *
 * Features:
 * – View existing lectures with drag-and-drop reorder
 * – Add new lecture with video upload (progress bar)
 * – Edit lecture inline
 * – Delete lecture with confirmation
 * – Toast notifications via UiContext
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Alert, Spinner,
} from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import AddLectureForm from '../../components/AddLectureForm';
import LectureList from '../../components/LectureList';
import { useUi } from '../../context/ui-context';
import {
  fetchLectures,
  deleteLecture,
  reorderLectures,
} from '../../services/lectures';
import { getCourseCurriculum } from '../../services/lessons';

export default function LectureManage() {
  const { courseId }  = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { showToast } = useUi();

  const [course,    setCourse]    = useState(null);
  const [lectures,  setLectures]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [editing,   setEditing]   = useState(null); // lecture being edited
  const [showForm,  setShowForm]  = useState(false);
  const [deleting,  setDeleting]  = useState(null); // lecture id being deleted

  // ── Load course + lectures ───────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [curriculum, lects] = await Promise.allSettled([
        getCourseCurriculum(parseInt(courseId)),
        fetchLectures(courseId),
      ]);

      if (curriculum.status === 'fulfilled') {
        setCourse(curriculum.value?.course ?? null);
      }
      if (lects.status === 'fulfilled') {
        setLectures(lects.value);
      } else {
        setError(lects.reason?.message || 'Failed to load lectures.');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleAddSuccess(newLecture) {
    setLectures((prev) => [...prev, newLecture].sort((a, b) => a.order_number - b.order_number));
    setShowForm(false);
    setEditing(null);
    showToast('Lecture added successfully!', 'success');
  }

  function handleEditSuccess(updated) {
    setLectures((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
    setEditing(null);
    showToast('Lecture updated successfully!', 'success');
  }

  async function handleDelete(lecture) {
    if (!window.confirm(`Delete "${lecture.title}"? This cannot be undone.`)) return;
    setDeleting(lecture.id);
    try {
      await deleteLecture(courseId, lecture.id);
      setLectures((prev) => prev.filter((l) => l.id !== lecture.id));
      showToast('Lecture deleted.', 'info');
    } catch (e) {
      showToast(e.message || 'Could not delete lecture.', 'error');
    } finally {
      setDeleting(null);
    }
  }

  async function handleReorder(reordered) {
    setLectures(reordered);
    const orderMap = reordered.map((l) => ({ id: l.id, order_number: l.order_number }));
    try {
      await reorderLectures(courseId, orderMap);
      showToast('Lecture order saved.', 'success');
    } catch {
      showToast('Could not save order – drag again.', 'error');
    }
  }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalDuration = lectures.reduce((t, l) => {
    if (!l.duration) return t;
    const [m, s] = l.duration.split(':').map(Number);
    return t + (m || 0) * 60 + (s || 0);
  }, 0);
  const durationLabel =
    totalDuration > 0
      ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
      : '—';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title="Manage Lectures">
      <Container className="py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/instructor/dashboard" className="text-decoration-none">Dashboard</Link>
            </li>
            {course && (
              <li className="breadcrumb-item">
                <Link to={`/instructor/courses/${courseId}/edit`} className="text-decoration-none">
                  {course.title}
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active">Lectures</li>
          </ol>
        </nav>

        {/* Page header */}
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1">
              <i className="bi bi-camera-video me-2 text-primary" />
              Lecture Management
            </h1>
            {course && (
              <p className="text-muted mb-0">
                {course.title}
                {course.category && (
                  <Badge bg="primary" className="ms-2" style={{ fontSize: '0.7rem' }}>{course.category}</Badge>
                )}
              </p>
            )}
          </div>
          <Button
            variant={showForm || editing ? 'outline-secondary' : 'primary'}
            className="rounded-pill px-4"
            onClick={() => { setEditing(null); setShowForm((v) => !v); }}
          >
            <i className={`bi ${showForm || editing ? 'bi-x' : 'bi-plus-lg'} me-2`} />
            {showForm || editing ? 'Close Form' : 'Add Lecture'}
          </Button>
        </div>

        {/* Stats row */}
        <Row className="g-3 mb-4">
          {[
            { label: 'Total Lectures', value: lectures.length, icon: 'bi-collection-play', color: '#6366f1' },
            { label: 'Free Previews',  value: lectures.filter((l) => l.is_free_preview).length, icon: 'bi-eye', color: '#10b981' },
            { label: 'Total Duration', value: durationLabel, icon: 'bi-clock-history', color: '#f59e0b' },
          ].map((s) => (
            <Col key={s.label} sm={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100">
                <Card.Body className="d-flex align-items-center gap-3 p-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 44, height: 44, background: `${s.color}20` }}
                  >
                    <i className={`bi ${s.icon}`} style={{ fontSize: '1.2rem', color: s.color }} />
                  </div>
                  <div>
                    <div className="fw-bold fs-5">{s.value}</div>
                    <div className="text-muted small">{s.label}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Global error */}
        {error && (
          <Alert variant="warning" dismissible onClose={() => setError(null)} className="rounded-3 mb-4">
            <i className="bi bi-exclamation-triangle me-2" />{error}
            <Button variant="link" size="sm" className="p-0 ms-3" onClick={loadData}>Retry</Button>
          </Alert>
        )}

        <Row className="g-4">
          {/* Left: form (when adding or editing) */}
          {(showForm || editing) && (
            <Col lg={5}>
              <AddLectureForm
                courseId={courseId}
                lecture={editing}
                onSuccess={editing ? handleEditSuccess : handleAddSuccess}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </Col>
          )}

          {/* Right: lecture list */}
          <Col lg={showForm || editing ? 7 : 12}>
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
              <Card.Header className="bg-transparent border-bottom px-4 pt-4 pb-3 d-flex align-items-center justify-content-between">
                <h5 className="fw-bold mb-0">
                  <i className="bi bi-list-ul me-2 text-primary" />
                  Lecture List
                  <Badge bg="secondary" className="ms-2">{lectures.length}</Badge>
                </h5>
                <small className="text-muted">
                  <i className="bi bi-arrows-move me-1" />Drag rows to reorder
                </small>
              </Card.Header>

              {loading ? (
                <div className="py-5 text-center">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-3 mb-0">Loading lectures…</p>
                </div>
              ) : (
                <LectureList
                  lectures={lectures}
                  isInstructor
                  onEdit={(lec) => { setEditing(lec); setShowForm(false); }}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                />
              )}

              {!loading && lectures.length === 0 && (
                <div className="text-center py-5">
                  <i className="bi bi-camera-video-off text-muted" style={{ fontSize: '2.5rem', opacity: 0.35 }} />
                  <h5 className="mt-3 text-muted fw-normal">No lectures yet</h5>
                  <p className="text-muted small mb-3">Add your first lecture using the form.</p>
                  <Button variant="primary" className="rounded-pill px-4"
                    onClick={() => { setShowForm(true); setEditing(null); }}>
                    <i className="bi bi-plus-lg me-2" />Add First Lecture
                  </Button>
                </div>
              )}
            </Card>

            {/* Preview link */}
            {lectures.length > 0 && (
              <div className="text-center mt-3">
                <Link
                  to={`/courses/${courseId}`}
                  className="btn btn-outline-primary rounded-pill px-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-eye me-2" />Preview Course Page
                </Link>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </DashboardLayout>
  );
}
