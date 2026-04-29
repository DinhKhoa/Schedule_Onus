import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import maleAvatar from '../icon/male.png';
import femaleAvatar from '../icon/female.png';
import adminAvatar from '../icon/admin.png';

function UserInfo() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels = {
    ADMIN: 'Quản trị viên',
    TRAINER: 'Huấn luyện viên',
    MEMBER: 'Hội viên'
  };

  const getAvatar = () => {
    if (user?.role === 'ADMIN') return adminAvatar;
    if (user?.gender === 'Female') return femaleAvatar;
    return maleAvatar;
  };

  return (
    <div className="user-info">
      <div className="user-info-details">
        <img src={getAvatar()} alt="avatar" className="user-avatar-img" />
        <div className="user-text-meta">
          <div className="user-name">{user?.fullName || 'Người dùng'}</div>
          <div className="user-role">{roleLabels[user?.role] || ''}</div>
        </div>
      </div>
      <button className="logout-btn" onClick={() => setShowLogoutModal(true)} title="Đăng xuất">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: 16, width: 400, maxWidth: '90%', padding: 32, position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 12px 0', color: '#111827', textAlign: 'center' }}>
              Đăng xuất
            </h3>
            <p style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 32 }}>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
               <button 
                 style={{ flex: 1, background: '#F3F4F6', border: 'none', color: '#374151', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                 onClick={() => setShowLogoutModal(false)}
               >
                 Hủy
               </button>
               <button 
                 style={{ flex: 1, background: '#EF4444', border: 'none', color: 'white', padding: '12px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                 onClick={confirmLogout}
               >
                 Đăng xuất
               </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .user-info { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-top: 1px solid #F3F4F6; margin-top: auto; }
        .user-info-details { display: flex; align-items: center; gap: 12px; }
        .user-avatar-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #F3F4F6; }
        .user-text-meta { display: flex; flex-direction: column; }
        .user-name { font-size: 14px; font-weight: 700; color: #111827; }
        .user-role { font-size: 12px; color: #6B7280; font-weight: 500; }
        .logout-btn { background: none; border: none; cursor: pointer; color: #EF4444; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .logout-btn:hover { background: #FEF2F2; transform: scale(1.05); }
      `}</style>
    </div>
  );
}

export default UserInfo;
