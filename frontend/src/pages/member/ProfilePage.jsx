import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';
import maleAvatar from '../../icon/male.png';
import femaleAvatar from '../../icon/female.png';

function ProfilePage() {
  const { user, updateAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [initialForm, setInitialForm] = useState({ fullName: '', phoneNumber: '', gender: '', dateOfBirth: '' });
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', gender: '', dateOfBirth: '' });
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setProfile(data);
      const formData = {
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        gender: data.gender || 'Male',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : ''
      };
      setForm(formData);
      setInitialForm(formData);
    } catch (err) { 
      console.error(err); 
      setError({ show: true, message: 'Không thể tải thông tin cá nhân' });
    } finally { 
      setLoading(false); 
    }
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    try {
      const { data } = await api.put('/users/profile', form);
      updateAuth(data.token, data.user); // Lưu Token mới và cập nhật UI
      setShowSuccess(true);
      fetchProfile();
    } catch (err) { 
      setError({ show: true, message: err.response?.data?.error || 'Lỗi cập nhật' }); 
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div className="profile-container">
      <div className="page-header" style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1 className="page-title" style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Hồ sơ cá nhân</h1>
        <p className="page-subtitle" style={{ color: '#6B7280', fontSize: 14 }}>Quản lý thông tin tài khoản của bạn</p>
      </div>

      <div className="card profile-card">
        <div className="profile-layout">
          {/* Cột trái: Avatar */}
          <div className="profile-left">
            <div className="avatar-wrapper">
              <img 
                src={form.gender === 'Female' ? femaleAvatar : maleAvatar} 
                alt="Avatar" 
                className="profile-avatar"
              />
              <div className="status-dot"></div>
            </div>
            <div className="role-text">Hội viên</div>
          </div>

          {/* Cột phải: Form */}
          <div className="profile-right">
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="field-label">Họ và tên</label>
                <input 
                  className="input profile-input" 
                  value={form.fullName} 
                  onChange={e => setForm({ ...form, fullName: e.target.value })} 
                  placeholder="Nhập họ và tên"
                  required 
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div className="form-group">
                  <label className="field-label">Số điện thoại</label>
                  <input 
                    className="input profile-input" 
                    value={form.phoneNumber} 
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">Giới tính</label>
                  <select 
                    className="input profile-input" 
                    value={form.gender} 
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 40 }}>
                <label className="field-label">Ngày sinh</label>
                <input 
                  className="input profile-input" 
                  type="date" 
                  value={form.dateOfBirth} 
                  onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} 
                  required 
                />
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: 12, borderTop: '1px solid #F3F4F6', paddingTop: 32 }}>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${!isDirty ? 'btn-disabled' : ''}`} 
                  style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600 }}
                  disabled={!isDirty}
                >
                  Lưu thay đổi
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600, background: '#F3F4F6', border: 'none', color: '#374151' }}
                  onClick={() => fetchProfile()}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .profile-container { max-width: 1000px; margin: 0 auto; padding-top: 10px; }
        .profile-card { padding: 48px; border-radius: 20px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); }
        .profile-layout { display: flex; gap: 60px; }
        .profile-left { display: flex; flex-direction: column; align-items: center; width: 180px; flex-shrink: 0; }
        .avatar-wrapper { position: relative; width: 140px; height: 140px; margin-bottom: 16px; }
        .profile-avatar { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid #F3F4F6; background: #F9FAFB; }
        .status-dot { position: absolute; bottom: 8px; right: 8px; width: 18px; height: 18px; background: #10B981; border: 3px solid white; border-radius: 50%; }
        .role-text { font-size: 14px; color: #6B7280; font-weight: 500; }
        .profile-right { flex-grow: 1; }
        .field-label { display: block; font-size: 13px; font-weight: 500; color: #6B7280; margin-bottom: 8px; }
        .profile-input { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px 16px; font-size: 15px; width: 100%; }
        .profile-input:focus { background: white; border-color: #2563EB; outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
        .profile-input:disabled { background: #F9FAFB; color: #374151; font-weight: 500; cursor: not-allowed; }
        .btn-disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 768px) {
          .profile-layout { flex-direction: column; align-items: center; gap: 40px; }
          .profile-left { width: 100%; }
          .profile-card { padding: 24px; }
        }
      `}</style>
      
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message="Cập nhật thông tin thành công!" />
      <ErrorModal 
        isOpen={error.show} 
        onClose={() => setError({ ...error, show: false })} 
        message={error.message} 
      />
    </div>
  );
}

export default ProfilePage;
