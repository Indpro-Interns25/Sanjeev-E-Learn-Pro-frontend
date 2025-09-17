import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login', { replace: true });
  };

  return (
    <div className="container py-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: 800 }}>
        <h2 className="text-center mb-4">Admin Dashboard</h2>
        
        {/* Course Management Section */}
        <div className="mb-4">
          <h4 className="mb-3">Course Management</h4>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h5>Add Course</h5>
                  <button className="btn btn-light mt-2">
                    Create New Course
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h5>Add Lessons</h5>
                  <button className="btn btn-light mt-2">
                    Create New Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Management Section */}
        <div className="mb-4">
          <h4 className="mb-3">Student Management</h4>
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="card bg-warning text-dark">
                <div className="card-body text-center">
                  <h5>Student Approval</h5>
                  <p className="small mb-2">Approve pending student registrations</p>
                  <button className="btn btn-dark">
                    Review Applications
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card bg-info text-white">
                <div className="card-body text-center">
                  <h5>Progress Reports</h5>
                  <p className="small mb-2">View student progress and analytics</p>
                  <button className="btn btn-light">
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <h4 className="mb-3">Quick Actions</h4>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card bg-secondary text-white">
                <div className="card-body text-center">
                  <h6>Manage Pricing</h6>
                  <button className="btn btn-light btn-sm">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card bg-dark text-white">
                <div className="card-body text-center">
                  <h6>System Settings</h6>
                  <button className="btn btn-light btn-sm">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <h6>User Management</h6>
                  <button className="btn btn-light btn-sm">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-3 border-top">
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}