import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Card,
  Button,
  Badge,
  Alert,
  ProgressBar,
  Row,
  Col,
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCourseQuiz, submitQuiz } from '../../services/quiz';
import { generateCertificate, saveCertificateLocally } from '../../services/certificates';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


// ─── helpers ─────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── component ────────────────────────────────────────────────────────────────
export default function Quiz() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // quiz data
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId → optionIndex
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null); // { score, total, percent, details }
  const [submitting, setSubmitting] = useState(false);
  const [certificate, setCertificate] = useState(null); // Certificate after passing

  // timer
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // ── load quiz ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getCourseQuiz(courseId || 1);
        setQuiz(data);
        setTimeLeft(data.timeLimit ?? 600);
      } catch (e) {
        setError(e.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  // ── countdown timer ──────────────────────────────────────────────────────
  const handleAutoSubmit = useCallback(() => {
    if (!submitted) doSubmit(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  useEffect(() => {
    if (!quiz || submitted || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [quiz, submitted, handleAutoSubmit]); // intentional: timer restarts only when quiz loads

  // ── compute result locally ───────────────────────────────────────────────
  function computeResult(answersMap, questions) {
    const details = questions.map((q) => ({
      questionId: q.id,
      text: q.text,
      selectedIndex: answersMap[q.id] ?? -1,
      correctIndex: q.correctIndex,
      options: q.options,
      correct: answersMap[q.id] === q.correctIndex,
    }));
    const score = details.filter((d) => d.correct).length;
    return { score, total: questions.length, percent: Math.round((score / questions.length) * 100), details };
  }

  // ── submit ───────────────────────────────────────────────────────────────
  async function doSubmit(auto = false) {
    if (submitting || submitted) return;
    clearInterval(timerRef.current);
    setSubmitting(true);

    let res = null;
    if (user && quiz) {
      res = await submitQuiz(user.id, quiz.id, answers);
    }

    // Use locally computed result if backend returned nothing
    const localResult = computeResult(answers, quiz?.questions ?? []);
    setResult(res ? { ...localResult, ...res } : localResult);
    setSubmitted(true);
    setSubmitting(false);
    if (auto) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Generate certificate on pass ─────────────────────────────────────────
  useEffect(() => {
    if (result && result.percent >= 60 && user && quiz) {
      const cert = generateCertificate({
        userId: user.id,
        courseId: parseInt(courseId),
        courseTitle: quiz.title || `Course ${courseId}`,
        quizId: quiz.id,
        score: result.score,
        totalScore: result.total,
        percentage: result.percent,
        instructorName: 'EduLearn Pro Team',
        completionDate: new Date().toISOString()
      });

      saveCertificateLocally(user.id, cert);
      setCertificate(cert);
      console.warn('✅ Certificate generated:', cert);
    }
  }, [result, user, quiz, courseId]);

  // ─── render helpers ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" />
    </div>
  );

  if (error) return (
    <Container className="py-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  if (!quiz) return null;

  const questions = quiz.questions ?? [];
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined).length;
  const timerDanger = timeLeft <= 60;

  // ── RESULTS SCREEN ────────────────────────────────────────────────────────
  if (submitted && result) {
    const passed = result.percent >= 60;
    const correctCount = result.details.filter((d) => d.correct).length;
    const wrongCount   = result.details.filter((d) => !d.correct).length;

    // Doughnut: correct vs wrong
    const doughnutData = {
      labels: ['Correct', 'Wrong'],
      datasets: [{
        data: [correctCount, wrongCount],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 6,
      }],
    };

    // Bar: per-question correctness (1 = correct, 0 = wrong)
    const barData = {
      labels: result.details.map((_, i) => `Q${i + 1}`),
      datasets: [{
        label: 'Score',
        data: result.details.map((d) => d.correct ? 1 : 0),
        backgroundColor: result.details.map((d) => d.correct ? '#10b981' : '#ef4444'),
        borderRadius: 4,
      }],
    };
    const barOptions = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, max: 1, ticks: { stepSize: 1, callback: (v) => (v === 1 ? '✓' : '✗') } },
        x: { grid: { display: false } },
      },
    };

    return (
      <Container className="py-5" style={{ maxWidth: 900 }}>
        {/* Score hero */}
        <Card
          className="border-0 shadow text-center mb-4"
          style={{ borderTop: `5px solid ${passed ? '#10b981' : '#ef4444'}` }}
        >
          <Card.Body className="py-5">
            <div
              className="fw-black mb-2"
              style={{
                fontSize: 'clamp(3.5rem, 12vw, 6rem)',
                color: passed ? '#10b981' : '#ef4444',
                lineHeight: 1,
              }}
            >
              {result.percent}%
            </div>
            <h2 className="h4 mb-1">
              {passed ? '🎉 Congratulations! You passed!' : '😔 Better luck next time'}
            </h2>
            <p className="text-muted mb-4">
              You answered <strong>{result.score}</strong> out of <strong>{result.total}</strong> questions correctly.
            </p>
            <Row className="justify-content-center g-3">
              <Col xs="auto">
                <Badge bg="success" className="px-3 py-2 fs-6">
                  <i className="bi bi-check-circle me-2" />{correctCount} Correct
                </Badge>
              </Col>
              <Col xs="auto">
                <Badge bg="danger" className="px-3 py-2 fs-6">
                  <i className="bi bi-x-circle me-2" />{wrongCount} Wrong
                </Badge>
              </Col>
              <Col xs="auto">
                <Badge bg={passed ? 'success' : 'warning'} className="px-3 py-2 fs-6">
                  {passed ? '✓ Passed' : '✗ Failed'} (pass ≥ 60%)
                </Badge>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Analytics charts */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom fw-semibold">
                <i className="bi bi-pie-chart me-2 text-primary" />Score Breakdown
              </Card.Header>
              <Card.Body className="d-flex align-items-center justify-content-center">
                <div style={{ maxWidth: 200, width: '100%' }}>
                  <Doughnut
                    data={doughnutData}
                    options={{ plugins: { legend: { position: 'bottom' } }, cutout: '65%' }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header className="bg-white border-bottom fw-semibold">
                <i className="bi bi-bar-chart me-2 text-primary" />Per-Question Performance
              </Card.Header>
              <Card.Body>
                <Bar data={barData} options={barOptions} height={120} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stats row */}
        <Row className="g-3 mb-4">
          {[
            { label: 'Score',          value: `${result.score}/${result.total}`,       icon: 'bi-trophy',         color: 'warning' },
            { label: 'Percentage',     value: `${result.percent}%`,                    icon: 'bi-percent',        color: 'primary' },
            { label: 'Accuracy',       value: `${Math.round((correctCount / result.total) * 100)}%`, icon: 'bi-bullseye', color: 'success' },
            { label: 'Status',         value: passed ? 'Passed' : 'Failed',            icon: 'bi-award',          color: passed ? 'success' : 'danger' },
          ].map((s) => (
            <Col key={s.label} xs={6} md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <i className={`bi ${s.icon} text-${s.color} mb-2`} style={{ fontSize: '1.5rem', display: 'block' }} />
                  <div className="fw-bold fs-5">{s.value}</div>
                  <div className="text-muted small">{s.label}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Answer review */}
        <h3 className="h5 fw-bold mb-3">Answer Review</h3>
        {result.details.map((d, idx) => (
          <Card
            key={d.questionId}
            className="mb-3 border-0 shadow-sm"
            style={{ borderLeft: `4px solid ${d.correct ? '#10b981' : '#ef4444'}` }}
          >
            <Card.Body>
              <p className="fw-semibold mb-2">
                <Badge bg={d.correct ? 'success' : 'danger'} className="me-2">Q{idx + 1}</Badge>
                {d.text}
              </p>
              <ul className="list-unstyled mb-0">
                {d.options.map((opt, oi) => {
                  const isSelected = d.selectedIndex === oi;
                  const isCorrect  = d.correctIndex === oi;
                  let variantCls = '';
                  if (isCorrect)                 variantCls = 'bg-success bg-opacity-10 text-success';
                  else if (isSelected && !isCorrect) variantCls = 'bg-danger bg-opacity-10 text-danger';
                  return (
                    <li key={oi} className={`d-flex align-items-center gap-2 rounded px-3 py-2 mb-1 ${variantCls}`}>
                      {isCorrect
                        ? <i className="bi bi-check-circle-fill text-success" />
                        : isSelected
                        ? <i className="bi bi-x-circle-fill text-danger" />
                        : <i className="bi bi-circle text-muted" />
                      }
                      <span>{opt}</span>
                      {isCorrect && <Badge bg="success" className="ms-auto">Correct</Badge>}
                      {isSelected && !isCorrect && <Badge bg="danger" className="ms-auto">Your answer</Badge>}
                    </li>
                  );
                })}
              </ul>
            </Card.Body>
          </Card>
        ))}

        {/* Certificate section for passing users */}
        {passed && certificate && (
          <Card className="border-0 shadow-sm bg-success bg-opacity-10 mb-4">
            <Card.Body className="text-center">
              <i className="bi bi-award-fill" style={{ fontSize: '2rem', color: '#10b981' }}></i>
              <h4 className="mt-2 mb-2 text-success">🎓 Certificate Awarded!</h4>
              <p className="text-muted mb-3">
                Congratulations! You have earned a certificate of completion.
              </p>
              <Button
                variant="success"
                onClick={() => navigate(`/student/certificate/${certificate.id}`)}
              >
                <i className="bi bi-download me-2"></i>View & Download Certificate
              </Button>
            </Card.Body>
          </Card>
        )}

        <div className="d-flex gap-3 mt-4 flex-wrap">
          <Button
            variant="primary"
            onClick={() => {
              setSubmitted(false);
              setResult(null);
              setAnswers({});
              setCurrentQ(0);
              setTimeLeft(quiz.timeLimit ?? 600);
              setCertificate(null);
            }}
          >
            <i className="bi bi-arrow-repeat me-2" />Retake Quiz
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2" />Back to Course
          </Button>
        </div>
      </Container>
    );
  }

  // ── QUIZ SCREEN ───────────────────────────────────────────────────────────
  const q = questions[currentQ];
  const totalQs = questions.length;

  return (
    <Container className="py-4" style={{ maxWidth: 780 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 fw-bold mb-0">{quiz.title}</h1>
        {/* Timer */}
        <div
          className={`d-flex align-items-center gap-2 px-3 py-2 rounded fw-semibold ${
            timerDanger ? 'bg-danger text-white' : 'bg-light text-dark'
          }`}
          style={{ transition: 'background 0.3s' }}
        >
          <i className={`bi bi-${timerDanger ? 'alarm' : 'clock'}`} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="d-flex justify-content-between mb-1">
        <small className="text-muted">Question {currentQ + 1} of {totalQs}</small>
        <small className="text-muted">{answeredCount} answered</small>
      </div>
      <ProgressBar
        now={Math.round(((currentQ + 1) / totalQs) * 100)}
        variant="primary"
        className="mb-4"
        style={{ height: 6 }}
      />

      {/* Auto-submit warning */}
      {timerDanger && (
        <Alert variant="warning" className="py-2 mb-3">
          <i className="bi bi-exclamation-triangle me-2" />
          <strong>Less than 1 minute remaining!</strong> The quiz will be submitted automatically when time runs out.
        </Alert>
      )}

      {/* Question card */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <h2 className="h5 fw-bold mb-4">
            <span className="text-primary me-2">Q{currentQ + 1}.</span>
            {q.text}
          </h2>
          <div className="d-flex flex-column gap-2">
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              return (
                <button
                  key={oi}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  className={`d-flex align-items-center gap-3 border rounded-3 px-4 py-3 text-start w-100 ${
                    selected
                      ? 'border-primary bg-primary bg-opacity-10 text-primary fw-semibold'
                      : 'border-light bg-light'
                  }`}
                  style={{ cursor: 'pointer', transition: 'all 0.15s', outline: 'none' }}
                >
                  <span
                    className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle border fw-semibold ${
                      selected ? 'bg-primary text-white border-primary' : 'bg-white text-muted'
                    }`}
                    style={{ width: 32, height: 32 }}
                  >
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Navigation */}
      <div className="d-flex justify-content-between align-items-center">
        <Button
          variant="outline-secondary"
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((n) => n - 1)}
        >
          <i className="bi bi-arrow-left me-2" />Previous
        </Button>

        {/* Question dots */}
        <div className="d-flex gap-1 flex-wrap justify-content-center">
          {questions.map((qItem, idx) => (
            <button
              key={qItem.id}
              onClick={() => setCurrentQ(idx)}
              className={`rounded-circle border-0 p-0 ${
                idx === currentQ
                  ? 'bg-primary'
                  : answers[qItem.id] !== undefined
                  ? 'bg-success'
                  : 'bg-secondary bg-opacity-25'
              }`}
              style={{ width: 10, height: 10, cursor: 'pointer' }}
              title={`Question ${idx + 1}`}
            />
          ))}
        </div>

        {currentQ < totalQs - 1 ? (
          <Button variant="primary" onClick={() => setCurrentQ((n) => n + 1)}>
            Next<i className="bi bi-arrow-right ms-2" />
          </Button>
        ) : (
          <Button
            variant="success"
            onClick={() => doSubmit()}
            disabled={submitting}
          >
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
              : <><i className="bi bi-send-check me-2" />Submit Quiz</>
            }
          </Button>
        )}
      </div>

      {/* Unanswered warning on last question */}
      {currentQ === totalQs - 1 && answeredCount < totalQs && (
        <Alert variant="warning" className="mt-3 py-2">
          <i className="bi bi-info-circle me-2" />
          You have <strong>{totalQs - answeredCount}</strong> unanswered question(s).
          You can still submit — unanswered questions count as wrong.
        </Alert>
      )}
    </Container>
  );
}
