import Login from './routes/Public/Login';
import Register from './routes/Public/Register';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { UiProvider } from './context/UiContext';

// Public Routes
import HomeRedirect from './components/HomeRedirect';
import Catalog from './routes/Public/Catalog';
import CourseDetail from './routes/Public/CourseDetail';
import ForgotPassword from './routes/Public/ForgotPassword';

// Student Routes
import StudentDashboard from './routes/Student/StudentDashboard';
import MyCourses from './routes/Student/MyCourses';
import LessonPlayer from './routes/Student/LessonPlayer';
import Progress from './routes/Student/Progress';

// Instructor Routes
import InstructorDashboard from './routes/Instructor/InstructorDashboard';
import CourseManage from './routes/Instructor/CourseManage';
import LessonManage from './routes/Instructor/LessonManage';

// Error Pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import About from './routes/Public/About';
import Contact from './routes/Public/Contact';
import Terms from './routes/Public/Terms';
import Privacy from './routes/Public/Privacy';

// Admin
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';



export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UiProvider>
          <Routes>
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/register"
              element={<Register />}
            />
            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />
            <Route
              path="*"
              element={
                <div className="d-flex flex-column min-vh-100">
                  <Navbar />
                  <main className="flex-grow-1">
                    <Routes>
                      <Route path="/" element={<HomeRedirect />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/courses/:courseId" element={<CourseDetail />} />
                      {/* /register handled above to remove header/footer */}
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />

                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminLogin />} />
                      <Route path="/admin-login" element={<AdminLogin />} />
                      <Route path="/admin-dashboard" element={<AdminDashboard />} />



                      {/* Student Routes */}
                      <Route path="/student" element={
                        <ProtectedRoute>
                          <RoleGuard roles={['student']}>
                            <Routes>
                              <Route path="dashboard" element={<StudentDashboard />} />
                              <Route path="courses/:courseId" element={<MyCourses />} />
                              <Route path="courses/:courseId/lessons/:lessonId" element={<LessonPlayer />} />
                              <Route path="progress" element={<Progress />} />
                            </Routes>
                          </RoleGuard>
                        </ProtectedRoute>
                      } />

                      {/* Instructor Routes */}
                      <Route path="/instructor" element={
                        <ProtectedRoute>
                          <RoleGuard roles={['instructor']}>
                            <Routes>
                              <Route path="dashboard" element={<InstructorDashboard />} />
                              <Route path="courses/new" element={<CourseManage />} />
                              <Route path="courses/:courseId/edit" element={<CourseManage />} />
                              <Route path="courses/:courseId/lessons" element={<LessonManage />} />
                            </Routes>
                          </RoleGuard>
                        </ProtectedRoute>
                      } />

                      {/* Error Routes */}
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </UiProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
