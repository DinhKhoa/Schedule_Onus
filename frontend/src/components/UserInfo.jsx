import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoutIcon from '../icon/logout.png';
import adminAvatar from '../icon/quantrivien.png';
import maleAvatar from '../icon/nam.png';
import femaleAvatar from '../icon/nu.png';

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
      <button className="logout-btn" onClick={() => setShowLogoutModal(true)} title="Đăng xuất">
        <img src={logoutIcon} alt="logout" style={{ width: 20, height: 20 }} />
      </button>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: 'white', borderRadius: 12, width: 460, maxWidth: '90%', padding: '24px 32px 32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <button 
               style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9CA3AF' }}
               onClick={() => setShowLogoutModal(false)}
            >
              ✕
            </button>
            
            <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '24px', marginTop: 24, marginBottom: 24 }}>
               <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px 0', color: '#334155' }}>
                 Xác nhận:
               </h3>
               <div style={{ fontSize: 15, color: '#64748B', fontStyle: 'italic' }}>
                 Bạn có chắc chắn muốn đăng xuất không?
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
               <button 
                 style={{ background: '#F1F5F9', border: 'none', color: '#0F172A', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                 onClick={() => setShowLogoutModal(false)}
               >
                 Quay lại
               </button>
               <button 
                 style={{ background: '#2563EB', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                 onClick={confirmLogout}
               >
                 Xác nhận
               </button>
            </div>
          </div>
        </div>
      )}

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
        .logout-btn:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}

export default UserInfo;
