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
        <div className="logout-modal-overlay">
          <div className="logout-modal-content">
            <button className="logout-modal-close" onClick={() => setShowLogoutModal(false)}>&times;</button>
            
            <div className="logout-modal-body">
              <h3 className="logout-modal-title">Xác nhận:</h3>
              <p className="logout-modal-desc">
                Bạn có chắc chắn muốn đăng xuất không?
              </p>
            </div>

            <div className="logout-modal-actions">
               <button 
                 className="logout-modal-btn cancel"
                 onClick={() => setShowLogoutModal(false)}
               >
                 Quay lại
               </button>
               <button 
                 className="logout-modal-btn confirm"
                 onClick={confirmLogout}
               >
                 Xác nhận
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
        .logout-btn { background: none; border: none; cursor: pointer; color: #9CA3AF; padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .logout-btn:hover { background: #FEF2F2; color: #EF4444; transform: scale(1.05); }

        .logout-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 10000; animation: fadeIn 0.2s; }
        .logout-modal-content { background: white; border-radius: 24px; width: 480px; padding: 40px 32px 32px; position: relative; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); animation: slideUp 0.3s; }
        .logout-modal-close { position: absolute; right: 24px; top: 16px; background: none; border: none; font-size: 28px; color: #9CA3AF; cursor: pointer; line-height: 1; }
        .logout-modal-close:hover { color: #374151; }
        
        .logout-modal-body { background: #F9FAFB; border-radius: 12px; padding: 32px 24px; margin-bottom: 24px; }
        .logout-modal-title { font-size: 18px; font-weight: 700; color: #4B5563; margin: 0 0 12px 0; }
        .logout-modal-desc { font-size: 16px; color: #6B7280; font-style: italic; margin: 0; }
        
        .logout-modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .logout-modal-btn { padding: 12px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
        .logout-modal-btn.cancel { background: #F3F4F6; color: #1F2937; }
        .logout-modal-btn.cancel:hover { background: #E5E7EB; }
        .logout-modal-btn.confirm { background: #2563EB; color: white; }
        .logout-modal-btn.confirm:hover { background: #1D4ED8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); }
        .logout-modal-btn:active { transform: scale(0.98); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default UserInfo;
