import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="top-bar" />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default ProtectedRoute;
