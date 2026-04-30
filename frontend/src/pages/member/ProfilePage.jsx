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
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

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
      updateAuth(data.token, data.user); 
      setShowSuccess(true);
      setInitialForm(form);
      setIsEditing(false);
    } catch (err) { 
      setError({ show: true, message: err.response?.data?.error || 'Lỗi cập nhật' }); 
    }
  };

  const validatePassword = (pw) => {
    const minLength = pw.length >= 8;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!validatePassword(passwordForm.newPassword)) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await api.put('/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setShowPasswordModal(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowSuccess(true);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Lỗi đổi mật khẩu');
    }
  };

  const handleCancelEdit = () => {
    setForm(initialForm);
    setIsEditing(false);
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
                  disabled={!isEditing}
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
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label className="field-label">Giới tính</label>
                  <select 
                    className="input profile-input" 
                    value={form.gender} 
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    disabled={!isEditing}
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
                  disabled={!isEditing}
                />
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: 12, borderTop: '1px solid #F3F4F6', paddingTop: 32 }}>
                {!isEditing ? (
                  <>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600, background: '#2563EB', color: 'white', border: 'none' }}
                      onClick={() => setIsEditing(true)}
                    >
                      Cập nhật thông tin
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600, background: 'white', border: '1px solid #E5E7EB', color: '#374151' }}
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Đổi mật khẩu
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      type="submit" 
                      className={`btn btn-primary ${!isDirty ? 'btn-disabled' : ''}`} 
                      style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600, background: '#2563EB', color: 'white', border: 'none' }}
                      disabled={!isDirty}
                    >
                      Lưu thay đổi
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      style={{ padding: '10px 24px', borderRadius: 8, fontWeight: 600, background: 'white', border: '1px solid #E5E7EB', color: '#374151' }}
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal Đổi mật khẩu */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content password-modal" style={{ padding: '32px', maxWidth: '480px' }}>
            <div className="modal-header" style={{ marginBottom: '24px' }}>
              <h2 className="modal-title" style={{ fontSize: '20px', fontWeight: 700 }}>Đổi mật khẩu</h2>
              <button className="close-btn" onClick={() => setShowPasswordModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="field-label" style={{ color: '#374151', marginBottom: 8 }}>Mật khẩu hiện tại</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.old ? "text" : "password"} 
                    className="input profile-input" 
                    value={passwordForm.oldPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    required
                    style={{ background: 'white', border: '1px solid #D1D5DB', paddingRight: '45px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}
                  >
                    {showPasswords.old ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="field-label" style={{ color: '#374151', marginBottom: 8 }}>Mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.new ? "text" : "password"} 
                    className="input profile-input" 
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    style={{ background: 'white', border: '1px solid #D1D5DB', paddingRight: '45px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}
                  >
                    {showPasswords.new ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: 20 }}>
                Tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt
              </p>

              <div className="form-group" style={{ marginBottom: 32 }}>
                <label className="field-label" style={{ color: '#374151', marginBottom: 8 }}>Xác nhận mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPasswords.confirm ? "text" : "password"} 
                    className="input profile-input" 
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    style={{ background: 'white', border: '1px solid #D1D5DB', paddingRight: '45px' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}
                  >
                    {showPasswords.confirm ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.06M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    )}
                  </button>
                </div>
              </div>
              
              {passwordError && (
                <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 16 }}>{passwordError}</div>
              )}

              <div className="modal-actions" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ padding: '10px 24px', borderRadius: 10, fontWeight: 600, background: '#F3F4F6', border: 'none', color: '#374151', minWidth: '100px' }} 
                  onClick={() => setShowPasswordModal(false)}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ padding: '10px 24px', borderRadius: 10, fontWeight: 600, background: '#2563EB', border: 'none', color: 'white', minWidth: '120px' }}
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .profile-container { max-width: 1000px; margin: 0 auto; padding-top: 10px; }
        .profile-card { padding: 48px; border-radius: 20px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); background: white; }
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
        .profile-input:disabled { background: #F3F4F6; color: #9CA3AF; cursor: not-allowed; }
        .btn { cursor: pointer; transition: all 0.2s; border: none; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); }
        .btn-primary:hover { background: #1d4ed8 !important; } /* Darker blue on hover */
        .btn:not(.btn-primary):hover { background: #E5E7EB !important; } /* Gray on hover for secondary buttons */
        .btn:active { transform: scale(0.98); }
        .btn-disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s; }
        .modal-content { background: white; border-radius: 24px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; }
        .modal-title { font-size: 20px; font-weight: 700; color: #111827; }
        .close-btn { background: none; border: none; font-size: 24px; color: #9CA3AF; cursor: pointer; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (max-width: 768px) {
          .profile-layout { flex-direction: column; align-items: center; gap: 40px; }
          .profile-left { width: 100%; }
          .profile-card { padding: 24px; }
        }
      `}</style>
      
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message="Thao tác thành công!" />
      <ErrorModal 
        isOpen={error.show} 
        onClose={() => setError({ ...error, show: false })} 
        message={error.message} 
      />
    </div>
  );
}

export default ProfilePage;
