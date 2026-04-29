import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
// Member pages
import MemberDashboard from './pages/member/DashboardPage';
import MemberSchedule from './pages/member/SchedulePage';
import MemberBooking from './pages/member/BookingPage';
import MemberProfile from './pages/member/ProfilePage';
import MemberChangePassword from './pages/member/ChangePasswordPage';
// PT pages
import PTSchedule from './pages/pt/SchedulePage';
import PTSessionDetail from './pages/pt/SessionDetailPage';
import PTSessionStatus from './pages/pt/SessionStatusPage';
import PTProfile from './pages/pt/ProfilePage';
// Admin pages
import AdminCoursePackage from './pages/admin/CoursePackagePage';
import AdminUserAccount from './pages/admin/UserAccountPage';
import AdminEnrollment from './pages/admin/EnrollmentPage';
import AdminBooking from './pages/admin/BookingPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Member routes */}
          <Route path="/member" element={<ProtectedRoute allowedRoles={['MEMBER']} />}>
            <Route index element={<MemberBooking />} />
            <Route path="schedule" element={<MemberSchedule />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="change-password" element={<MemberChangePassword />} />
          </Route>

          {/* PT routes */}
          <Route path="/pt" element={<ProtectedRoute allowedRoles={['TRAINER']} />}>
            <Route index element={<PTSchedule />} />
            <Route path="session/:id" element={<PTSessionDetail />} />
            <Route path="session/:id/status" element={<PTSessionStatus />} />
            <Route path="profile" element={<PTProfile />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route index element={<Navigate to="course-package" replace />} />
            <Route path="course-package" element={<AdminCoursePackage />} />
            <Route path="user-account" element={<AdminUserAccount />} />
            <Route path="enrollment" element={<AdminEnrollment />} />
            <Route path="booking" element={<AdminBooking />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
