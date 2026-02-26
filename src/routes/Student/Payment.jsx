import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Button,
  Alert,
  Badge,
  Row,
  Col,
  Spinner,
} from 'react-bootstrap';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getCourseById } from '../../data/mockCourses';
import { loadRazorpayScript, createOrder, verifyPayment } from '../../services/payment';

// ─── helpers ─────────────────────────────────────────────────────────────────
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_YOUR_KEY';

function formatINR(paise) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
}

// ─── component ────────────────────────────────────────────────────────────────
export default function Payment() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | failed
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  // Optional: override amount via query param (e.g. after coupon)
  const discountedPaise = searchParams.get('amount');

  useEffect(() => {
    const data = getCourseById(parseInt(courseId));
    setCourse(data || null);

    // Pre-load Razorpay SDK in the background
    loadRazorpayScript().then(setScriptLoaded);
  }, [courseId]);

  if (!isAuthenticated) {
    return (
      <Container className="py-5 text-center" style={{ maxWidth: 480 }}>
        <Alert variant="warning">
          Please <Button variant="link" className="p-0" onClick={() => navigate('/login')}>sign in</Button> before purchasing.
        </Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const amountPaise = discountedPaise
    ? parseInt(discountedPaise, 10)
    : Math.round((course.price ?? 0) * 100);

  const isFree = amountPaise === 0;

  // ── Trigger Razorpay popup ────────────────────────────────────────────────
  async function handlePay() {
    if (!scriptLoaded) {
      setErrorMsg('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const order = await createOrder(parseInt(courseId), amountPaise);
      setOrderInfo(order);

      if (order.demo) {
        // Simulate success immediately in demo mode
        setTimeout(() => {
          setPaymentId('pay_demo_' + Date.now());
          setStatus('success');
        }, 1200);
        return;
      }

      const options = {
        key: order.key || RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'EduLearn Pro',
        description: course.title,
        image: '/logo.png',
        order_id: order.orderId,
        prefill: {
          name: user?.name ?? '',
          email: user?.email ?? '',
        },
        theme: { color: '#4F8EF7' },
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
              userId: user?.id,
            });
            setPaymentId(response.razorpay_payment_id);
            setStatus('success');
          } catch {
            setStatus('failed');
            setErrorMsg('Payment verified on gateway but server verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            if (status === 'loading') setStatus('idle');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setStatus('failed');
        setErrorMsg(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (e) {
      setStatus('failed');
      setErrorMsg(e.message || 'Something went wrong. Please try again.');
    }
  }

  // ── Free enrollment ───────────────────────────────────────────────────────
  async function handleFreeEnroll() {
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 800)); // simulate API call
    setPaymentId('free_' + Date.now());
    setStatus('success');
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <Container className="py-5" style={{ maxWidth: 560 }}>
        <Card className="border-0 shadow text-center p-5">
          <div className="display-1 mb-3">🎉</div>
          <h2 className="fw-bold mb-2">Enrollment Confirmed!</h2>
          <p className="text-muted mb-1">
            You are now enrolled in <strong>{course.title}</strong>.
          </p>
          {paymentId && (
            <p className="text-muted small mb-4">
              Payment ID: <code>{paymentId}</code>
            </p>
          )}
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-2">
            <Button variant="primary" onClick={() => navigate(`/student/courses/${courseId}`)}>
              <i className="bi bi-play-circle me-2" />Start Learning
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate('/student/my-courses')}>
              <i className="bi bi-collection me-2" />My Courses
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  // ─── Main payment screen ──────────────────────────────────────────────────
  return (
    <Container className="py-5" style={{ maxWidth: 680 }}>
      <h1 className="h3 fw-bold mb-4">Complete Your Enrollment</h1>

      {errorMsg && (
        <Alert variant="danger" dismissible onClose={() => setErrorMsg('')}>
          <i className="bi bi-exclamation-triangle me-2" />{errorMsg}
        </Alert>
      )}

      <Row className="g-4">
        {/* Course summary */}
        <Col md={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h2 className="h5 fw-bold mb-3">Order Summary</h2>
              <div className="d-flex gap-3 mb-4">
                {course.image && (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="rounded"
                    style={{ width: 80, height: 60, objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <div>
                  <p className="fw-semibold mb-1">{course.title}</p>
                  <small className="text-muted">
                    {course.instructor?.name && <><i className="bi bi-person me-1" />{course.instructor.name}</>}
                  </small>
                  {course.language && (
                    <Badge bg="light" text="dark" className="d-block mt-1" style={{ width: 'fit-content' }}>
                      {course.language}
                    </Badge>
                  )}
                </div>
              </div>

              <ul className="list-unstyled mb-0 small text-muted">
                {course.lessons?.length > 0 && (
                  <li className="mb-1"><i className="bi bi-play-btn me-2 text-primary" />{course.lessons.length} lessons</li>
                )}
                {course.level && (
                  <li className="mb-1"><i className="bi bi-bar-chart me-2 text-primary" />{course.level}</li>
                )}
                <li className="mb-1"><i className="bi bi-infinity me-2 text-primary" />Lifetime access</li>
                <li><i className="bi bi-award me-2 text-primary" />Certificate of completion</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Payment panel */}
        <Col md={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column">
              <h2 className="h5 fw-bold mb-4">Payment Details</h2>

              <div className="d-flex justify-content-between mb-2">
                <span>Course Price</span>
                <span>{formatINR(amountPaise)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 text-muted small">
                <span>Taxes (included)</span>
                <span>—</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                <span>Total</span>
                <span className="text-primary">{isFree ? 'Free' : formatINR(amountPaise)}</span>
              </div>

              <div className="d-flex gap-3 mt-auto text-center small text-muted mb-3">
                <i className="bi bi-shield-lock fs-4 text-success" />
                <span>Secured by 256-bit SSL encryption</span>
              </div>

              {isFree ? (
                <Button
                  variant="success"
                  size="lg"
                  className="w-100"
                  onClick={handleFreeEnroll}
                  disabled={status === 'loading'}
                >
                  {status === 'loading'
                    ? <><Spinner animation="border" size="sm" className="me-2" />Enrolling…</>
                    : <><i className="bi bi-check-circle me-2" />Enroll for Free</>
                  }
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100"
                  onClick={handlePay}
                  disabled={status === 'loading'}
                >
                  {status === 'loading'
                    ? <><Spinner animation="border" size="sm" className="me-2" />Processing…</>
                    : <><i className="bi bi-credit-card me-2" />Pay {formatINR(amountPaise)}</>
                  }
                </Button>
              )}

              <p className="text-center text-muted small mt-3 mb-0">
                <i className="bi bi-arrow-counterclockwise me-1" />
                30-day money-back guarantee
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
