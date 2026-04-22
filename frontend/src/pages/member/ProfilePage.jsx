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
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileRes, enrollRes] = await Promise.all([
        api.get(`/users/${user.id}`),
        api.get('/dang-ky-khoa-tap')
      ]);
      const data = profileRes.data;
      if (data.ngaySinh) {
        data.ngaySinh = new Date(data.ngaySinh).toISOString().split('T')[0];
      }
      setProfile(data);
      setInitialProfile({ ...data });
      setEnrollments(enrollRes.data?.filter?.(e => e.hoiVienId?._id === user.id) || []);
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
              <img src={getAvatar()} alt="Avatar" className="profile-img" />
              <div className="status-indicator"></div>
            </div>
            <div className="role-text">Member</div>
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

        {/* Enrollments */}
        <div style={{ marginTop: 40 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#111827' }}>
            Khóa tập đã đăng ký
          </h3>
          {enrollments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: '#6B7280', background: 'white', borderRadius: 16, border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
              <p>Chưa đăng ký khóa tập nào</p>
            </div>
          ) : (
            <div className="enrollment-list">
              {enrollments.map(e => (
                <div key={e._id} className="enrollment-card-new">
                  <div className="enrollment-header">
                    <span className="enrollment-name">{e.khoaTapId?.tenKhoaTap || '—'}</span>
                    <span className="badge-sessions">{e.soBuoiConLai} buổi còn lại</span>
                  </div>
                  <div className="enrollment-details">
                    <div className="detail-item">
                      <span className="detail-label">PT:</span>
                      <span className="detail-value">{e.ptId?.hoTen || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Ngày đăng ký:</span>
                      <span className="detail-value">
                        {e.ngayDangKy ? new Date(e.ngayDangKy).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          animation: fadeIn 0.5s ease-out;
        }
        .profile-layout-new {
          max-width: 1000px;
          margin: 0 auto;
          padding-bottom: 40px;
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
          transition: all 0.2s;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
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
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-update:hover:not(:disabled) {
          background: #2563EB;
          transform: translateY(-1px);
        }
        .btn-update:disabled {
          background: #93C5FD;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .btn-password {
          background: white;
          color: #374151;
          border: 1px solid #D1D5DB;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-password:hover {
          background: #F9FAFB;
          border-color: #9CA3AF;
        }
        
        .enrollment-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }
        .enrollment-card-new {
          background: white;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          padding: 24px;
          transition: transform 0.2s;
        }
        .enrollment-card-new:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .enrollment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .enrollment-name {
          font-weight: 700;
          font-size: 16px;
          color: #111827;
        }
        .badge-sessions {
          background: #EFF6FF;
          color: #1D4ED8;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }
        .enrollment-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .detail-item {
          display: flex;
          gap: 8px;
          font-size: 14px;
        }
        .detail-label {
          color: #6B7280;
        }
        .detail-value {
          color: #111827;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default ProfilePage;
