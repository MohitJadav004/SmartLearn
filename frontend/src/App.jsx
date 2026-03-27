import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider, useConfirm } from './context/ConfirmContext';
import ToastContainer from './components/ToastContainer';
import ConfirmDialog from './components/ConfirmDialog';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseDetail from './pages/CourseDetail';
import { StudentCourseDetail } from './pages/StudentCourseDetail';
import LessonDetail from './pages/LessonDetail';
import AllCoursesPage from './pages/AllCoursesPage';
import EnrolledCoursesPage from './pages/EnrolledCoursesPage';
import './App.css';

function AppContent() {
  const { confirm } = useConfirm();
  
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/all-courses"
          element={
            <ProtectedRoute requiredRole="student">
              <AllCoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-courses"
          element={
            <ProtectedRoute requiredRole="student">
              <EnrolledCoursesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student-course/:courseId"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentCourseDetail />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course/:courseId/chapter/:chapterId/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <LessonDetail />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ConfirmDialog
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        isDangerous={confirm.isDangerous}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <ToastContainer />
            <AppContent />
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
