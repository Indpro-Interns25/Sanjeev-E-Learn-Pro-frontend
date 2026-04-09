import { NavDropdown, Badge, Button } from 'react-bootstrap';
import { useNotifications } from '../context/NotificationContext';

function formatWhen(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAllRead,
    markAsRead,
    removeNotification,
  } = useNotifications();

  return (
    <NavDropdown
      align="end"
      id="notifications-dropdown"
      title={
        <span className="position-relative d-inline-flex align-items-center">
          <i className="bi bi-bell fs-5" />
          {unreadCount > 0 && (
            <Badge
              pill
              bg="danger"
              className="position-absolute top-0 start-100 translate-middle"
              style={{ fontSize: '0.6rem' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </span>
      }
    >
      <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between" style={{ minWidth: 320 }}>
        <strong>Notifications</strong>
        <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={markAllRead}>
          Mark all read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <div className="px-3 py-4 text-center text-muted">No notifications yet</div>
      ) : (
        notifications.slice(0, 8).map((n) => (
          <div
            key={n.id}
            className={`px-3 py-2 border-bottom ${n.read ? '' : 'bg-light'}`}
            role="button"
            onClick={() => markAsRead(n.id)}
          >
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div>
                <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{n.title}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>{n.message}</div>
                <small className="text-muted">{formatWhen(n.createdAt)}</small>
              </div>
              <Button
                variant="link"
                size="sm"
                className="p-0 text-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(n.id);
                }}
                aria-label="Remove notification"
              >
                <i className="bi bi-x-lg" />
              </Button>
            </div>
          </div>
        ))
      )}
    </NavDropdown>
  );
}
