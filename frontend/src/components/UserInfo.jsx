import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoutIcon from '../icon/logout.png';
import adminAvatar from '../icon/quantrivien.png';
import maleAvatar from '../icon/nam.png';
import femaleAvatar from '../icon/nu.png';

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

  const getAvatar = () => {
    if (user?.vaiTro === 'ADMIN') return adminAvatar;
    if (user?.gioiTinh === 'Nữ') return femaleAvatar;
    return maleAvatar;
  };

  return (
    <div className="user-info">
      <div className="user-info-details">
        <img src={getAvatar()} alt="avatar" className="user-avatar-img" />
        <div>
          <div className="user-name">{user?.hoTen || user?.taiKhoan || 'User'}</div>
          <div className="user-role">{roleLabels[user?.vaiTro] || ''}</div>
        </div>
      </div>
      <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
        <img src={logoutIcon} alt="logout" style={{ width: 20, height: 20 }} />
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
        .user-avatar-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
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
