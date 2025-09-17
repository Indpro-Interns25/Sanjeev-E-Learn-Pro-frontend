import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="container py-5">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: 700 }}>
        <h2 className="text-center mb-4">Admin Panel</h2>
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-4">
            <div className="border rounded p-3 h-100 text-center bg-light">
              <h5>Add Course</h5>
              <button className="btn btn-primary w-100 mt-2" disabled>Add</button>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded p-3 h-100 text-center bg-light">
              <h5>Add Lesson</h5>
              <button className="btn btn-primary w-100 mt-2" disabled>Add</button>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded p-3 h-100 text-center bg-light">
              <h5>Manage Pricing</h5>
              <button className="btn btn-primary w-100 mt-2" disabled>Manage</button>
            </div>
          </div>
        </div>
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6">
            <div className="border rounded p-3 h-100 text-center bg-light">
              <h5>Approve Students</h5>
              <button className="btn btn-success w-100 mt-2" disabled>Approve</button>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="border rounded p-3 h-100 text-center bg-light">
              <h5>Approve Teachers</h5>
              <button className="btn btn-success w-100 mt-2" disabled>Approve</button>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <button
            className="btn btn-outline-danger"
            onClick={() => {
              localStorage.removeItem('adminToken');
              navigate('/admin-login', { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
