import { lazy, Suspense } from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { UiProvider } from './context/UiContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import GlobalToast from './components/GlobalToast';
import LoadingOverlay from './components/LoadingOverlay';
import Chatbot from './components/Chatbot';

// ── Lazy imports ──────────────────────────────────────────────────────────────
const Navbar        = lazy(() => import('./components/Navbar'));
const Footer        = lazy(() => import('./components/Footer'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const RoleGuard     = lazy(() => import('./components/RoleGuard'));
const HomeRedirect  = lazy(() => import('./components/HomeRedirect'));

// Public
const LandingPage    = lazy(() => import('./routes/Public/LandingPage'));
const Explore        = lazy(() => import('./routes/Public/Explore'));
const Catalog        = lazy(() => import('./routes/Public/Catalog'));

// Student
const HomePage       = lazy(() => import('./routes/Student/HomePage'));
const CourseDetail   = lazy(() => import('./routes/Public/CourseDetail'));
const ForgotPassword = lazy(() => import('./routes/Public/ForgotPassword'));
const About          = lazy(() => import('./routes/Public/About'));
const Contact        = lazy(() => import('./routes/Public/Contact'));
const Terms          = lazy(() => import('./routes/Public/Terms'));
const Privacy        = lazy(() => import('./routes/Public/Privacy'));
const VideoDemo      = lazy(() => import('./routes/Public/VideoDemo'));
const Login          = lazy(() => import('./routes/Public/Login'));
const Register       = lazy(() => import('./routes/Public/Register'));

// Student
const StudentDashboard  = lazy(() => import('./routes/Student/StudentDashboard'));
const StudentCourses    = lazy(() => import('./routes/Student/StudentCourses'));
const MyEnrolledCourses = lazy(() => import('./routes/Student/MyEnrolledCourses'));
const EnrolledCourseView = lazy(() => import('./routes/Student/EnrolledCourseView'));
const MyCourses         = lazy(() => import('./routes/Student/MyCourses'));
const LessonPlayer      = lazy(() => import('./routes/Student/LessonPlayer'));
const Progress          = lazy(() => import('./routes/Student/Progress'));
const MyLearning        = lazy(() => import('./routes/Student/MyLearning'));
const Quiz              = lazy(() => import('./routes/Student/Quiz'));
const CertificatePage   = lazy(() => import('./routes/Student/CertificatePage'));
const CourseChat        = lazy(() => import('./routes/Student/CourseChat'));
const Messages          = lazy(() => import('./routes/Student/Messages'));
const Payment           = lazy(() => import('./routes/Student/Payment'));
const Profile           = lazy(() => import('./routes/Student/Profile'));
const PaymentHistory    = lazy(() => import('./routes/Student/PaymentHistory'));
const LiveClassRoom     = lazy(() => import('./routes/Live/LiveClassRoom'));

// Instructor
const InstructorDashboard = lazy(() => import('./routes/Instructor/InstructorDashboard'));
const InstructorAddCourse = lazy(() => import('./routes/Instructor/InstructorAddCourse'));
const CourseManage        = lazy(() => import('./routes/Instructor/CourseManage'));
const LessonManage        = lazy(() => import('./routes/Instructor/LessonManage'));
const LectureManage       = lazy(() => import('./routes/Instructor/LectureManage'));

// Student (new)
const CourseLearning      = lazy(() => import('./routes/Student/CourseLearning'));

// Admin
const AdminLogin          = lazy(() => import('./components/AdminLogin'));
const AdminLanding        = lazy(() => import('./components/AdminLanding'));
const AddCourse           = lazy(() => import('./routes/Admin/AddCourse'));
const AnalyticsDashboard  = lazy(() => import('./routes/Admin/AnalyticsDashboard'));

// Error pages
const NotFound     = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// ── Layout for routes with Navbar and Footer ──────────────────────────────────
function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

// ── Page-level spinner (shown during chunk loading) ───────────────────────────
function PageSpinner() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="loading-spinner-ring" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UiProvider>
          <ChatProvider>
            <NotificationProvider>
              <LoadingOverlay />
              <GlobalToast />
              <Chatbot />
              <Suspense fallback={<PageSpinner />}>
                <Routes>
                <Route path="/login"         element={<Login />} />
                <Route path="/register"      element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Admin Routes - No Navbar */}
                <Route path="/admin"          element={<AdminLogin />} />
                <Route path="/admin-login"    element={<AdminLogin />} />
                <Route path="/admin-dashboard" element={<AdminLanding />} />
                <Route path="/admin/courses/add" element={<AddCourse />} />
                <Route path="/admin/analytics"   element={<AnalyticsDashboard />} />

                {/* All other routes wrapped with shared Navbar + Footer */}
                <Route element={<MainLayout />}>
                  <Route path="/"         element={<LandingPage />} />
                  <Route path="/explore"  element={<Explore />} />
                  <Route path="/home"     element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={<HomeRedirect />} />
                  <Route path="/catalog"  element={<Catalog />} />
                  <Route path="/courses/:courseId" element={<CourseDetail />} />
                  <Route path="/courses/:courseId/lessons/:lessonId/preview" element={<LessonPlayer />} />
                  <Route path="/video-demo" element={<VideoDemo />} />
                  <Route path="/about"   element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/terms"   element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />

                  {/* ── Student Routes ────────────────────────────── */}
                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <StudentDashboard />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/student/courses" element={<StudentCourses />} />
                  <Route path="/student/my-courses" element={<MyEnrolledCourses />} />
                  <Route path="/student/course/:courseId" element={<EnrolledCourseView />} />
                  <Route
                    path="/student/courses/:courseId"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <MyCourses />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/courses/:courseId/lessons/:lessonId"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <LessonPlayer />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/progress"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <Progress />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/my-learning"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <MyLearning />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/courses/:courseId/quiz"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <Quiz />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/certificate/:certificateId"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <CertificatePage />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/chat"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <CourseChat />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/messages"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <Messages />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/live/:classId"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student', 'instructor', 'admin']}>
                          <LiveClassRoom />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/courses/:courseId/chat"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <CourseChat />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/courses/:courseId/pay"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <Payment />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/profile"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <Profile />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/payment-history"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <PaymentHistory />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/course-learning/:courseId"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['student']}>
                          <CourseLearning />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Instructor Routes ─────────────────────────── */}
                  <Route
                    path="/instructor/dashboard"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['instructor']}>
                          <InstructorDashboard />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/courses/new"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['instructor']}>
                          <InstructorAddCourse />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/courses/:courseId/edit"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['instructor']}>
                          <CourseManage />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/courses/:courseId/lessons"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['instructor']}>
                          <LessonManage />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/courses/:courseId/lectures"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['instructor']}>
                          <LectureManage />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/courses/:courseId/learn"
                    element={
                      <ProtectedRoute>
                        <CourseLearning />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/courses/:courseId/learn/:lectureId"
                    element={
                      <ProtectedRoute>
                        <CourseLearning />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/instructor/profile"
                    element={
                      <ProtectedRoute>
                        <RoleGuard roles={['instructor']}>
                          <Profile />
                        </RoleGuard>
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Error Routes ──────────────────────────────── */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                </Route>

                {/* ── Not Found Route ─────────────────────────────── */}
                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </NotificationProvider>
          </ChatProvider>
        </UiProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}


