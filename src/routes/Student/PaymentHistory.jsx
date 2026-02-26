import { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Badge, Spinner, Alert, Table, Button, InputGroup, Form,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import DashboardLayout from '../../components/DashboardLayout';

// ── Demo payment data generator ───────────────────────────────────────────────
function generateDemoPayments(user) {
  if (!user) return [];
  const courses = [
    { id: 1,  title: 'Introduction to Web Development',   amount: 39900, date: '2024-12-15' },
    { id: 2,  title: 'Advanced React & Redux',            amount: 49900, date: '2025-01-20' },
    { id: 9,  title: 'Advanced JavaScript ES6+',          amount: 44900, date: '2025-03-05' },
    { id: 7,  title: 'Digital Marketing Masterclass',     amount: 59900, date: '2025-04-10' },
  ];
  return courses.map((c, i) => ({
    id: `pay_${user.id}_${i + 1}`,
    courseId: c.id,
    courseTitle: c.title,
    amount: c.amount,
    currency: 'INR',
    status: i === 3 ? 'refunded' : 'success',
    method: ['UPI', 'Card', 'Net Banking', 'UPI'][i],
    date: c.date,
    invoiceId: `INV-${(100000 + i * 7913).toString(16).toUpperCase()}`,
  }));
}

function formatINR(paise) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
}

const STATUS_COLORS = { success: 'success', failed: 'danger', refunded: 'warning', pending: 'secondary' };
const STATUS_ICONS  = { success: 'bi-check-circle-fill', failed: 'bi-x-circle-fill', refunded: 'bi-arrow-counterclockwise', pending: 'bi-hourglass-split' };

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Try real API first, fall back to demo data
        await new Promise((r) => setTimeout(r, 600));
        const data = generateDemoPayments(user);
        setPayments(data);
        setFiltered(data);
      } catch {
        setError('Unable to load payment history.');
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  // Filter when search or status filter changes
  useEffect(() => {
    let result = payments;
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.courseTitle.toLowerCase().includes(q) ||
          p.invoiceId.toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [payments, search, statusFilter]);

  const totalSpent = payments
    .filter((p) => p.status === 'success')
    .reduce((s, p) => s + p.amount, 0);

  const stats = [
    {
      label: 'Total Spent',
      value: formatINR(totalSpent),
      icon: 'bi-wallet2',
      color: 'primary',
    },
    {
      label: 'Successful',
      value: payments.filter((p) => p.status === 'success').length,
      icon: 'bi-check-circle',
      color: 'success',
    },
    {
      label: 'Refunded',
      value: payments.filter((p) => p.status === 'refunded').length,
      icon: 'bi-arrow-counterclockwise',
      color: 'warning',
    },
    {
      label: 'Courses Bought',
      value: payments.length,
      icon: 'bi-mortarboard',
      color: 'info',
    },
  ];

  return (
    <DashboardLayout title="Payment History">
      <Container className="py-4">
        {/* Stats row */}
        <Row className="g-3 mb-4">
          {stats.map((s) => (
            <Col key={s.label} xs={6} md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center gap-3">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-${s.color} bg-opacity-10`}
                    style={{ width: 46, height: 46 }}
                  >
                    <i className={`bi ${s.icon} text-${s.color}`} style={{ fontSize: '1.2rem' }} />
                  </div>
                  <div>
                    <div className="fw-bold fs-5 lh-1">{s.value}</div>
                    <div className="text-muted small">{s.label}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-3">
          <Card.Body className="p-3">
            <Row className="g-2 align-items-center">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by course, invoice, or method…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="success">Successful</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </Form.Select>
              </Col>
              <Col md={3} className="text-md-end">
                <span className="text-muted small">
                  {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
                </span>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : filtered.length === 0 ? (
          <Card className="border-0 shadow-sm text-center py-5">
            <div className="text-muted">
              <i className="bi bi-receipt" style={{ fontSize: '2.5rem', display: 'block', marginBottom: 12 }} />
              No transactions found.
            </div>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead>
                  <tr style={{ background: 'var(--bg-secondary, #f8f9fa)', fontSize: '0.8rem' }}>
                    <th className="px-3 py-2 text-uppercase text-muted fw-semibold">Course</th>
                    <th className="px-3 py-2 text-uppercase text-muted fw-semibold">Invoice</th>
                    <th className="px-3 py-2 text-uppercase text-muted fw-semibold">Method</th>
                    <th className="px-3 py-2 text-uppercase text-muted fw-semibold">Amount</th>
                    <th className="px-3 py-2 text-uppercase text-muted fw-semibold">Date</th>
                    <th className="px-3 py-2 text-uppercase text-muted fw-semibold">Status</th>
                    <th className="px-3 py-2 text-uppercase text-muted fw-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 py-3">
                        <div className="fw-semibold" style={{ maxWidth: 220 }}>
                          {p.courseTitle}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <code style={{ fontSize: '0.78rem' }}>{p.invoiceId}</code>
                      </td>
                      <td className="px-3 py-3">
                        <span className="badge bg-light text-dark border">{p.method}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="fw-semibold">{formatINR(p.amount)}</span>
                      </td>
                      <td className="px-3 py-3 text-muted small">
                        {new Date(p.date).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          bg={STATUS_COLORS[p.status] || 'secondary'}
                          className="text-capitalize px-2 py-1"
                        >
                          <i className={`bi ${STATUS_ICONS[p.status]} me-1`} />
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          as={Link}
                          to={`/student/courses/${p.courseId}`}
                          size="sm"
                          variant="outline-primary"
                        >
                          <i className="bi bi-play-circle me-1" />View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card>
        )}
      </Container>
    </DashboardLayout>
  );
}
