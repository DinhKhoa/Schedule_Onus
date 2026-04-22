import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import maleAvatar from '../../icon/nam.png';
import femaleAvatar from '../../icon/nu.png';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [initialProfile, setInitialProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/users/${user.id}`);
      if (data.ngaySinh) {
        data.ngaySinh = new Date(data.ngaySinh).toISOString().split('T')[0];
      }
      setProfile(data);
      setInitialProfile({ ...data });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isChanged = useMemo(() => {
    if (!profile || !initialProfile) return false;
    return JSON.stringify(profile) !== JSON.stringify(initialProfile);
  }, [profile, initialProfile]);

  const handleUpdate = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.put('/users/profile', profile);
      if (data.ngaySinh) {
        data.ngaySinh = new Date(data.ngaySinh).toISOString().split('T')[0];
      }
      setProfile(data);
      setInitialProfile({ ...data });
      updateUser({ hoTen: data.hoTen, gioiTinh: data.gioiTinh });
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Có lỗi xảy ra' });
    } finally {
      setSaving(false);
    }
  };

  const getAvatar = () => {
    if (profile?.gioiTinh === 'Nữ') return femaleAvatar;
    return maleAvatar;
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', fontFamily: '"Inter", sans-serif' }}>Đang tải...</div>;

  return (
    <div className="profile-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Hồ sơ cá nhân</h1>
          <p className="page-subtitle">Quản lý thông tin tài khoản của bạn</p>
        </div>
      </div>

      <div className="profile-layout-new">
        <div className="profile-main-card">
          <div className="profile-sidebar">
            <div className="avatar-container">
              <img 
                src={getAvatar()} 
                alt="Profile" 
                className="profile-img"
              />
              <div className="status-indicator"></div>
            </div>
            <div className="role-text">PT</div>
          </div>

          <div className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  value={profile?.hoTen || ''} 
                  onChange={(e) => setProfile({ ...profile, hoTen: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input 
                  type="text" 
                  value={profile?.soDienThoai || ''} 
                  onChange={(e) => setProfile({ ...profile, soDienThoai: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Giới tính</label>
                <select 
                  value={profile?.gioiTinh || ''} 
                  onChange={(e) => setProfile({ ...profile, gioiTinh: e.target.value })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ngày sinh</label>
                <input 
                  type="date" 
                  value={profile?.ngaySinh || ''} 
                  onChange={(e) => setProfile({ ...profile, ngaySinh: e.target.value })}
                />
              </div>
            </div>

            {message.text && (
              <div style={{ 
                marginTop: 16, 
                padding: '10px 14px', 
                borderRadius: 8, 
                fontSize: 14,
                backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                color: message.type === 'success' ? '#059669' : '#DC2626',
                border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`
              }}>
                {message.text}
              </div>
            )}

            <div className="form-actions">
              <button 
                className="btn-update" 
                disabled={!isChanged || saving}
                onClick={handleUpdate}
              >
                {saving ? 'Đang lưu...' : 'Cập nhật thông tin'}
              </button>
              <button className="btn-password" onClick={() => setIsPasswordModalOpen(true)}>
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
      />

      <style>{`
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          animation: fadeIn 0.5s ease-out;
        }
        .profile-layout-new {
          max-width: 1000px;
          margin: 0 auto;
          padding-bottom: 40px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .profile-main-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          display: flex;
          padding: 40px;
          gap: 60px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }
        .profile-sidebar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          min-width: 160px;
        }
        .avatar-container {
          position: relative;
          width: 100px;
          height: 100px;
        }
        .profile-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #F3F4F6;
        }
        .status-indicator {
          position: absolute;
          bottom: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          background: #10B981;
          border: 3px solid white;
          border-radius: 50%;
        }
        .role-text {
          font-weight: 700;
          color: #111827;
          font-size: 18px;
        }
        .profile-form {
          flex: 1;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        .form-group input, .form-group select {
          padding: 12px 16px;
          border-radius: 10px;
          border: 1px solid #E5E7EB;
          background-color: #F9FAFB;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
          background-color: white;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .form-actions {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }
        .btn-update {
          background: #3B82F6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-update:hover:not(:disabled) {
          background: #2563EB;
          transform: translateY(-1px);
        }
        .btn-update:disabled {
          background: #3B82F6;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .btn-password {
          background: white;
          color: #374151;
          border: 1px solid #D1D5DB;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-password:hover {
          background: #F9FAFB;
          border-color: #9CA3AF;
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;
