import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Table,
  ProgressBar,
  Badge,
} from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { getAnalytics } from '../../services/analytics';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ─── helpers ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = 'primary' }) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body className="d-flex align-items-center gap-3">
        <div
          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-${color} bg-opacity-10`}
          style={{ width: 54, height: 54 }}
        >
          <i className={`bi bi-${icon} fs-4 text-${color}`} />
        </div>
        <div>
          <div className="fw-bold fs-4 lh-1 mb-1">{value}</div>
          <div className="text-muted small">{label}</div>
          {sub && <div className="text-success small fw-semibold">{sub}</div>}
        </div>
      </Card.Body>
    </Card>
  );
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } },
};

// ─── component ────────────────────────────────────────────────────────────────
export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalytics();
      setData(result);
      setLastRefresh(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (error) return (
    <Container className="py-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  const { stats, monthlyRevenue, enrollmentsByMonth, topCourses, usersByRole } = data;

  // ── Revenue chart ──────────────────────────────────────────────────────────
  const revenueData = {
    labels: monthlyRevenue.map((d) => d.month),
    datasets: [{
      label: 'Revenue (₹)',
      data: monthlyRevenue.map((d) => d.revenue / 100),
      backgroundColor: 'rgba(79,142,247,0.15)',
      borderColor: '#4F8EF7',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#4F8EF7',
    }],
  };

  // ── Enrollment chart ───────────────────────────────────────────────────────
  const enrollData = {
    labels: enrollmentsByMonth.map((d) => d.month),
    datasets: [{
      label: 'Enrollments',
      data: enrollmentsByMonth.map((d) => d.count),
      backgroundColor: 'rgba(16,185,129,0.7)',
      borderRadius: 6,
    }],
  };

  // ── Users by role donut ────────────────────────────────────────────────────
  const roleData = {
    labels: Object.keys(usersByRole).map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{
      data: Object.values(usersByRole),
      backgroundColor: ['#4F8EF7', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }],
  };

  return (
    <Container fluid className="py-4 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="h3 fw-bold mb-0">Analytics Dashboard</h1>
          <small className="text-muted">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={load}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-2" />Refresh
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            <i className="bi bi-arrow-left me-2" />Back
          </button>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <StatCard
            icon="people"
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            sub={`+${stats.newUsersThisMonth} this month`}
            color="primary"
          />
        </Col>
        <Col xs={6} lg={3}>
          <StatCard
            icon="cash-stack"
            label="Total Revenue"
            value={`₹${(stats.totalRevenue / 100).toLocaleString('en-IN')}`}
            sub={`+₹${(stats.revenueThisMonth / 100).toLocaleString('en-IN')} this month`}
            color="success"
          />
        </Col>
        <Col xs={6} lg={3}>
          <StatCard
            icon="mortarboard"
            label="Total Enrollments"
            value={stats.totalEnrollments.toLocaleString()}
            sub={`+${stats.enrollmentsThisMonth} this month`}
            color="info"
          />
        </Col>
        <Col xs={6} lg={3}>
          <StatCard
            icon="bar-chart-fill"
            label="Avg Completion"
            value={`${stats.avgCompletion}%`}
            sub={`${stats.totalCourses} active courses`}
            color="warning"
          />
        </Col>
      </Row>

      {/* ── Charts row ──────────────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        {/* Revenue line chart */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Monthly Revenue</h5>
            </Card.Header>
            <Card.Body style={{ height: 280 }}>
              <Line
                data={revenueData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      callbacks: {
                        label: (ctx) => `₹${ctx.raw.toLocaleString('en-IN')}`,
                      },
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Users by role donut */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Users by Role</h5>
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center" style={{ height: 280 }}>
              <div style={{ maxWidth: 240, width: '100%' }}>
                <Doughnut
                  data={roleData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    cutout: '65%',
                    plugins: { legend: { position: 'bottom' } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Enrollment bar chart ─────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Monthly Enrollments</h5>
            </Card.Header>
            <Card.Body style={{ height: 240 }}>
              <Bar data={enrollData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Top courses table ────────────────────────────────────────────────── */}
      <Row className="g-3">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Top Performing Courses</h5>
              <Badge bg="light" text="dark">by enrollment</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Course</th>
                    <th className="text-end">Enrolled</th>
                    <th style={{ minWidth: 180 }}>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((c, i) => (
                    <tr key={i}>
                      <td className="text-muted align-middle">{i + 1}</td>
                      <td className="fw-semibold align-middle">{c.title}</td>
                      <td className="text-end align-middle">{c.enrolled.toLocaleString()}</td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center gap-2">
                          <ProgressBar
                            now={c.completion}
                            variant={c.completion >= 70 ? 'success' : c.completion >= 50 ? 'warning' : 'danger'}
                            style={{ height: 8, flex: 1 }}
                          />
                          <small className="text-muted" style={{ minWidth: 34 }}>{c.completion}%</small>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
