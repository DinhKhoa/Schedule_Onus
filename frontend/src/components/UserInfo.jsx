import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function UserInfo() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels = {
    ADMIN: 'Quản trị viên',
    PT: 'Huấn luyện viên',
    HOIVIEN: 'Hội viên'
  };

  return (
    <div className="user-info">
      <div className="user-info-details">
        <span className="user-avatar">👤</span>
        <div>
          <div className="user-name">{user?.hoTen || user?.taiKhoan || 'User'}</div>
          <div className="user-role">{roleLabels[user?.vaiTro] || ''}</div>
        </div>
      </div>
      <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
        🚪
      </button>

      <style>{`
        .user-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-top: 1px solid var(--color-border);
        }
        .user-info-details {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-avatar {
          font-size: 24px;
        }
        .user-name {
          font-size: 14px;
          font-weight: 600;
        }
        .user-role {
          font-size: 12px;
          color: var(--color-text-light);
        }
        .logout-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          color: var(--color-danger);
        }
      `}</style>
    </div>
  );
}

export default UserInfo;
