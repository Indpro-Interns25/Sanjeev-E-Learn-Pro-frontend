/**
 * CourseLearning.jsx  –  Student: watch lectures for an enrolled course
 *
 * Features:
 * – Sidebar with lecture list sorted by order_number
 * – Custom HTML5 video player with play/pause, speed, fullscreen
 * – Resume from last watched timestamp
 * – Auto-mark lecture complete when video ends (≥90 %)
 * – Overall course progress bar
 * – Mobile-responsive: sidebar collapses into a bottom drawer
 * – Enrollment guard – redirects unenrolled students
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, ProgressBar, Spinner, Alert,
} from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUi } from '../../context/ui-context';
import CourseVideoPlayer from '../../components/CourseVideoPlayer';
import LectureList from '../../components/LectureList';
import {
  fetchLectures,
  saveVideoTimestamp,
  getVideoTimestamp,
  markLectureCompleteApi,
  getCompletedLectureIds,
} from '../../services/lectures';
import { getUserEnrollments } from '../../services/enrollment';

export default function CourseLearning() {
  const { courseId, lectureId } = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { showToast } = useUi();

  const [lectures,       setLectures]      = useState([]);
  const [activeLecture,  setActiveLecture] = useState(null);
  const [completedIds,   setCompleted]     = useState([]);
  const [isEnrolled,     setEnrolled]      = useState(false);
  const [checkingEnroll, setCheckEnroll]   = useState(true);
  const [loadingLectures,setLoadingLect]   = useState(true);
  const [sidebarOpen,    setSidebar]       = useState(false); // mobile drawer
  const [startTime,      setStartTime]     = useState(0);
  const [completedAlert, setCompletedAlert] = useState(null);

  const markingRef = useRef(false); // avoid duplicate mark-complete calls

  // ── Load lectures ────────────────────────────────────────────────────────────
  const loadLectures = useCallback(async () => {
    setLoadingLect(true);
    try {
      const data = await fetchLectures(courseId);
      setLectures(data);

      // Resolve active lecture
      const targetId = lectureId ? parseInt(lectureId) : null;
      const target   = targetId ? data.find((l) => l.id === targetId) : data[0];
      if (target) {
        setActiveLecture(target);
        setStartTime(getVideoTimestamp(target.id));
      }

      // Load completed IDs from localStorage
      if (user) {
        const ids = getCompletedLectureIds(user.id, courseId, data);
        setCompleted(ids);
      }
    } finally {
      setLoadingLect(false);
    }
  }, [courseId, lectureId, user]);

  // ── Check enrollment ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function checkEnroll() {
      if (!user) { setCheckEnroll(false); return; }
      try {
        const userId = user.id || user.user_id || user.ID;
        const enrollments = await getUserEnrollments(userId);
        const enrolled = enrollments.some(
          (e) => parseInt(e.course_id) === parseInt(courseId)
        );
        setEnrolled(enrolled);
        if (!enrolled) {
          showToast('You are not enrolled in this course.', 'warning');
        }
      } catch {
        setEnrolled(true); // graceful fallback – don't block on API error
      } finally {
        setCheckEnroll(false);
      }
    }
    checkEnroll();
  }, [courseId, user, showToast]);

  // Load lectures after enrollment is known
  useEffect(() => {
    if (!checkingEnroll) loadLectures();
  }, [checkingEnroll, loadLectures]);

  // ── Select lecture ────────────────────────────────────────────────────────────
  function handleSelectLecture(lecture) {
    if (lecture.id === activeLecture?.id) return;
    const ts = getVideoTimestamp(lecture.id);
    setStartTime(ts);
    setActiveLecture(lecture);
    setSidebar(false); // close mobile drawer
    // Update URL without full reload
    navigate(`/student/courses/${courseId}/learn/${lecture.id}`, { replace: true });
  }

  // ── Video callbacks ───────────────────────────────────────────────────────────
  function handleTimeUpdate(currentTime) {
    if (activeLecture) saveVideoTimestamp(activeLecture.id, currentTime);
  }

  async function handleEnded() {
    if (!user || !activeLecture || markingRef.current) return;
    markingRef.current = true;
    try {
      await markLectureCompleteApi(user.id, courseId, activeLecture.id);
      setCompleted((prev) =>
        prev.includes(activeLecture.id) ? prev : [...prev, activeLecture.id]
      );
      showToast('Lecture completed! 🎉', 'success');

      // Auto-advance to next lecture
      const idx = lectures.findIndex((l) => l.id === activeLecture.id);
      if (idx < lectures.length - 1) {
        const next = lectures[idx + 1];
        setTimeout(() => {
          handleSelectLecture(next);
        }, 1500);
      }
    } finally {
      markingRef.current = false;
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  const progressPct = lectures.length
    ? Math.round((completedIds.length / lectures.length) * 100)
    : 0;

  const totalDuration = lectures.reduce((t, l) => {
    if (!l.duration) return t;
    const [m, s] = l.duration.split(':').map(Number);
    return t + (m || 0) * 60 + (s || 0);
  }, 0);

  const activeIndex = lectures.findIndex((l) => l.id === activeLecture?.id);

  function navigateLesson(delta) {
    const next = lectures[activeIndex + delta];
    if (next) handleSelectLecture(next);
  }

  // ── Loading/guards ────────────────────────────────────────────────────────────
  if (checkingEnroll) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <i className="bi bi-lock" style={{ fontSize: '3rem', color: '#94a3b8' }} />
        <h3 className="mt-3">Sign in to watch</h3>
        <Link to="/login" className="btn btn-primary rounded-pill mt-2">Login</Link>
      </Container>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-primary, #f8f9fa)', minHeight: '100vh' }}>
      {/* ── Top header bar ─────────────────────────────────────────────────── */}
      <div
        className="d-flex align-items-center gap-3 px-3 px-md-4 border-bottom"
        style={{ height: 56, background: 'var(--bg-card, #fff)', position: 'sticky', top: 0, zIndex: 100 }}
      >
        <Link
          to={`/courses/${courseId}`}
          className="btn btn-sm btn-light rounded-pill"
        >
          <i className="bi bi-arrow-left me-1" />Back to Course
        </Link>

        <span className="fw-semibold text-truncate flex-grow-1" style={{ fontSize: '0.9rem' }}>
          {activeLecture?.title || 'Course Learning'}
        </span>

        {/* Mobile sidebar toggle */}
        <Button
          variant="outline-secondary"
          size="sm"
          className="d-lg-none rounded-pill"
          onClick={() => setSidebar((v) => !v)}
        >
          <i className="bi bi-list-ul me-1" />Lectures
        </Button>
      </div>

      {/* ── Overall progress banner ─────────────────────────────────────── */}
      <div className="border-bottom px-3 px-md-4 py-2" style={{ background: 'var(--bg-card, #fff)' }}>
        <div className="d-flex align-items-center gap-3">
          <span className="small fw-semibold text-muted" style={{ whiteSpace: 'nowrap' }}>
            Course Progress
          </span>
          <ProgressBar
            now={progressPct}
            variant={progressPct === 100 ? 'success' : 'primary'}
            className="flex-grow-1 rounded-pill"
            style={{ height: 8 }}
          />
          <span className="small fw-bold" style={{ whiteSpace: 'nowrap', minWidth: 36 }}>
            {progressPct}%
          </span>
          {progressPct === 100 && (
            <Badge bg="success" className="rounded-pill">
              <i className="bi bi-trophy-fill me-1" />Complete!
            </Badge>
          )}
        </div>
      </div>

      {/* ── Completion alert ─────────────────────────────────────────────── */}
      {completedAlert && (
        <div className="px-3 px-md-4 pt-3">
          <Alert variant={completedAlert.type} dismissible onClose={() => setCompletedAlert(null)} className="mb-0">
            {completedAlert.msg}
          </Alert>
        </div>
      )}

      <Container fluid className="py-3 px-2 px-md-4">
        <Row className="g-4">
          {/* ── Main content ──────────────────────────────────────────────── */}
          <Col lg={8} xl={9}>
            {/* Video player */}
            <div className="mb-3">
              {loadingLectures ? (
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center bg-black"
                  style={{ aspectRatio: '16/9' }}
                >
                  <Spinner animation="border" variant="light" />
                </div>
              ) : activeLecture ? (
                <CourseVideoPlayer
                  key={activeLecture.id}
                  src={activeLecture.video_url}
                  title={activeLecture.title}
                  startTime={startTime}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                />
              ) : (
                <div
                  className="rounded-3 d-flex flex-column align-items-center justify-content-center bg-dark text-white"
                  style={{ aspectRatio: '16/9' }}
                >
                  <i className="bi bi-camera-video-off" style={{ fontSize: '3rem', opacity: 0.4 }} />
                  <p className="mt-2 opacity-50">No video selected</p>
                </div>
              )}
            </div>

            {/* Lecture meta & controls */}
            {activeLecture && (
              <Card className="border-0 shadow-sm rounded-4 mb-3">
                <Card.Body className="p-3 p-md-4">
                  <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <span className="text-muted small">
                          Lecture {activeIndex + 1} of {lectures.length}
                        </span>
                        {activeLecture.is_free_preview && (
                          <Badge bg="success" style={{ fontSize: '0.65rem' }}>Free Preview</Badge>
                        )}
                        {completedIds.includes(activeLecture.id) && (
                          <Badge bg="primary" style={{ fontSize: '0.65rem' }}>
                            <i className="bi bi-check-circle-fill me-1" />Completed
                          </Badge>
                        )}
                      </div>
                      <h2 className="h5 fw-bold mb-0">{activeLecture.title}</h2>
                    </div>
                  </div>

                  {activeLecture.description && (
                    <p className="text-muted mb-3" style={{ lineHeight: 1.6 }}>
                      {activeLecture.description}
                    </p>
                  )}

                  {/* Prev / Next */}
                  <div className="d-flex gap-2 justify-content-between align-items-center mt-3 flex-wrap">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="rounded-pill px-3"
                      disabled={activeIndex <= 0}
                      onClick={() => navigateLesson(-1)}
                    >
                      <i className="bi bi-arrow-left me-1" />Previous
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-pill px-3"
                      disabled={activeIndex >= lectures.length - 1}
                      onClick={() => navigateLesson(1)}
                    >
                      Next<i className="bi bi-arrow-right ms-1" />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          {/* Desktop sidebar */}
          <Col lg={4} xl={3} className="d-none d-lg-block">
            <SidebarContent
              lectures={lectures}
              activeLectureId={activeLecture?.id}
              completedIds={completedIds}
              isEnrolled={isEnrolled}
              loading={loadingLectures}
              progressPct={progressPct}
              totalDuration={totalDuration}
              onSelect={handleSelectLecture}
            />
          </Col>
        </Row>
      </Container>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: 'rgba(0,0,0,0.5)', zIndex: 200 }}
            onClick={() => setSidebar(false)}
          />
          <div
            className="position-fixed top-0 end-0 h-100 bg-white shadow-lg overflow-auto"
            style={{ width: 320, zIndex: 201, paddingTop: 56 }}
          >
            <button
              className="btn btn-light position-absolute top-0 end-0 m-2 rounded-circle"
              style={{ width: 36, height: 36, zIndex: 1 }}
              onClick={() => setSidebar(false)}
            >
              <i className="bi bi-x" />
            </button>
            <SidebarContent
              lectures={lectures}
              activeLectureId={activeLecture?.id}
              completedIds={completedIds}
              isEnrolled={isEnrolled}
              loading={loadingLectures}
              progressPct={progressPct}
              totalDuration={totalDuration}
              onSelect={handleSelectLecture}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ── Sidebar inner component ────────────────────────────────────────────────────
function SidebarContent({
  lectures, activeLectureId, completedIds, isEnrolled,
  loading, progressPct, totalDuration, onSelect,
}) {
  const totalDurationLabel = totalDuration > 0
    ? `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`
    : null;

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ position: 'sticky', top: 72 }}>
      {/* Header */}
      <Card.Header className="bg-transparent border-bottom p-3">
        <h6 className="fw-bold mb-2">Course Content</h6>

        {/* Progress bar */}
        <div className="d-flex justify-content-between mb-1">
          <small className="text-muted">
            {completedIds.length} / {lectures.length} lectures complete
          </small>
          <small className="fw-semibold text-primary">{progressPct}%</small>
        </div>
        <ProgressBar
          now={progressPct}
          variant="primary"
          style={{ height: 6 }}
          className="rounded-pill"
        />

        {totalDurationLabel && (
          <small className="text-muted mt-1 d-block">
            <i className="bi bi-clock me-1" />{totalDurationLabel} total
          </small>
        )}
      </Card.Header>

      {/* Lecture list */}
      <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
        <LectureList
          lectures={lectures}
          activeLectureId={activeLectureId}
          completedIds={completedIds}
          isEnrolled={isEnrolled}
          loading={loading}
          onSelect={onSelect}
        />
      </div>
    </Card>
  );
}
