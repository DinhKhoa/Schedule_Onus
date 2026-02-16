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
import AdminKhoaTap from './pages/admin/KhoaTapPage';
import AdminTaiKhoan from './pages/admin/TaiKhoanPage';
import AdminDangKyKhoa from './pages/admin/DangKyKhoaPage';
import AdminLichTap from './pages/admin/LichTapPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Member routes */}
          <Route path="/member" element={<ProtectedRoute allowedRoles={['HOIVIEN']} />}>
            <Route index element={<MemberDashboard />} />
            <Route path="schedule" element={<MemberSchedule />} />
            <Route path="booking" element={<MemberBooking />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="change-password" element={<MemberChangePassword />} />
          </Route>

          {/* PT routes */}
          <Route path="/pt" element={<ProtectedRoute allowedRoles={['PT']} />}>
            <Route index element={<PTSchedule />} />
            <Route path="session/:id" element={<PTSessionDetail />} />
            <Route path="session/:id/status" element={<PTSessionStatus />} />
            <Route path="profile" element={<PTProfile />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route index element={<Navigate to="khoa-tap" replace />} />
            <Route path="khoa-tap" element={<AdminKhoaTap />} />
            <Route path="tai-khoan" element={<AdminTaiKhoan />} />
            <Route path="dang-ky-khoa" element={<AdminDangKyKhoa />} />
            <Route path="lich-tap" element={<AdminLichTap />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
