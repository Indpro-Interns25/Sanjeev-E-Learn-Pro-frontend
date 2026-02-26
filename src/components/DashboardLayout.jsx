import { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import DarkModeToggle from './DarkModeToggle';

/* ── Nav configs per role ──────────────────────────────────────────────────── */
const STUDENT_NAV = [
  { section: 'Overview' },
  { to: '/student/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/student/my-learning', icon: 'bi-collection-play', label: 'My Learning' },
  { to: '/student/my-courses', icon: 'bi-journal-bookmark', label: 'My Courses' },
  { section: 'Learning' },
  { to: '/student/progress', icon: 'bi-graph-up', label: 'Progress' },
  { to: '/student/chat', icon: 'bi-chat-dots', label: 'Course Chat' },
  { section: 'Account' },
  { to: '/student/profile', icon: 'bi-person-circle', label: 'Profile' },
  { to: '/student/payment-history', icon: 'bi-receipt', label: 'Payment History' },
  { to: '/catalog', icon: 'bi-grid', label: 'Browse Courses' },
];

const INSTRUCTOR_NAV = [
  { section: 'Overview' },
  { to: '/instructor/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { section: 'Content' },
  { to: '/instructor/courses/new', icon: 'bi-plus-circle', label: 'Add Course' },
  { to: '/catalog', icon: 'bi-grid', label: 'Browse Catalog' },
  { section: 'Lectures' },
  { to: '/instructor/dashboard#lectures', icon: 'bi-camera-video', label: 'Manage Lectures' },
  { section: 'Account' },
  { to: '/instructor/profile', icon: 'bi-person-circle', label: 'Profile' },
];

const ADMIN_NAV = [
  { section: 'Overview' },
  { to: '/admin-dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/admin/analytics', icon: 'bi-bar-chart-line', label: 'Analytics' },
  { section: 'Management' },
  { to: '/admin/courses/add', icon: 'bi-plus-circle', label: 'Add Course' },
  { to: '/catalog', icon: 'bi-grid', label: 'Browse Catalog' },
];

function getNav(role) {
  if (role === 'instructor') return INSTRUCTOR_NAV;
  if (role === 'admin')      return ADMIN_NAV;
  return STUDENT_NAV;
}

/* ── Sidebar ───────────────────────────────────────────────────────────────── */
function Sidebar({ role, user, onLogout, open, onClose }) {
  const navigate = useNavigate();
  const navItems = getNav(role);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="sidebar-backdrop d-md-none"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside className={`edu-sidebar ${open ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
            <polygon points="32,10 60,22 32,34 4,22 32,10" fill="#4F8EF7" stroke="#222" strokeWidth="2"/>
            <rect x="26" y="34" width="12" height="12" rx="3" fill="#fff" stroke="#4F8EF7" strokeWidth="2"/>
            <line x1="32" y1="34" x2="32" y2="54" stroke="#222" strokeWidth="2"/>
            <circle cx="32" cy="56" r="2.5" fill="#FFD700" stroke="#222" strokeWidth="1.5"/>
          </svg>
          <span className="fw-bold" style={{ fontSize: 16 }}>EduLearn Pro</span>
          <button
            className="btn btn-sm ms-auto d-md-none p-0"
            onClick={onClose}
            style={{ color: 'inherit', lineHeight: 1 }}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* User info pill */}
        <div
          className="d-flex align-items-center gap-2 px-3 py-2 mx-2 mt-2 mb-1 rounded-3"
          style={{ background: 'var(--sidebar-hover-bg, #f8f9fa)', fontSize: '0.82rem' }}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              width={30}
              height={30}
              className="rounded-circle"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white flex-shrink-0"
              style={{ width: 30, height: 30, fontSize: 12, fontWeight: 700 }}
            >
              {(user?.name?.[0] || 'U').toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden">
            <div className="fw-semibold text-truncate" style={{ lineHeight: 1.2 }}>
              {user?.name || 'User'}
            </div>
            <div style={{ color: 'var(--text-muted, #adb5bd)', fontSize: '0.72rem' }}>
              {role?.charAt(0).toUpperCase() + role?.slice(1)}
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <div key={`sec-${i}`} className="sidebar-section-label">
                  {item.section}
                </div>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? ' active' : ''}`
                }
                onClick={onClose}
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ms-auto badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-top px-2 py-3 mt-auto">
          <button
            className="sidebar-link w-100 border-0"
            style={{ background: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 6 }}
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right text-danger" />
            <span className="text-danger">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  role: PropTypes.string,
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

/* ── DashboardLayout ───────────────────────────────────────────────────────── */
export default function DashboardLayout({ children, title }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggle = useCallback(() => setSidebarOpen((p) => !p), []);
  const close  = useCallback(() => setSidebarOpen(false), []);

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="edu-app-shell">
      <Sidebar
        role={user?.role}
        user={user}
        onLogout={logout}
        open={sidebarOpen}
        onClose={close}
      />

      <div className="edu-main-content">
        {/* Mini top bar for mobile toggle + title */}
        <header
          className="d-flex align-items-center gap-2 px-3 py-2 border-bottom sticky-top"
          style={{ minHeight: 56, background: 'var(--bg-navbar, #fff)', zIndex: 100 }}
        >
          <button
            className="btn btn-sm d-md-none me-1 p-1"
            onClick={toggle}
            aria-label="Toggle sidebar"
            style={{ fontSize: '1.25rem', color: 'var(--text-primary, #212529)', background: 'none', border: 'none' }}
          >
            <i className="bi bi-list" />
          </button>
          {title && (
            <span className="fw-semibold" style={{ fontSize: '1rem', color: 'var(--text-primary, #212529)' }}>
              {title}
            </span>
          )}
          <div className="ms-auto d-flex align-items-center gap-2">
            <DarkModeToggle />
          </div>
        </header>

        <div className="flex-grow-1">
          {children}
        </div>
      </div>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};
