import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';
import DataTable from '../../components/DataTable';
import { AddIcon } from '../../components/Icons';
import editIcon from '../../icon/edit.png';
import deleteIcon from '../../icon/delete.png';
import { getLocalDateString } from '../../utils/dateUtils';

function UserAccountPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    fullName: '', phoneNumber: '',
    gender: 'Male', dateOfBirth: '', role: 'MEMBER', status: 'Active'
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ fullName: '', phoneNumber: '', gender: 'Male', dateOfBirth: '', role: 'MEMBER', status: 'Active' });
    setModal(true);
  };

  const openEdit = (u) => {
    setEditId(u._id);
    setForm({
      fullName: u.fullName, phoneNumber: u.phoneNumber,
      gender: u.gender || 'Male', dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : '',
      role: u.role, status: u.status
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     if (!form.fullName || form.fullName.trim().length < 2) {
      return setError({ show: true, message: 'Họ tên phải có ít nhất 2 ký tự' });
    }
    if (form.fullName.trim().length > 50) {
      return setError({ show: true, message: 'Họ tên không được quá 50 ký tự' });
    }
    if (/\d/.test(form.fullName)) {
      return setError({ show: true, message: 'Họ tên không được chứa chữ số' });
    }
    if (!/^[0-9]{10}$/.test(form.phoneNumber)) {
      return setError({ show: true, message: 'Số điện thoại phải có đúng 10 chữ số' });
    }
    if (!form.dateOfBirth) {
      return setError({ show: true, message: 'Ngày sinh là bắt buộc' });
    }
    const birthDate = new Date(form.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) {
      return setError({ show: true, message: 'Người dùng phải từ 18 tuổi trở lên' });
    }
    if (age > 100) {
      return setError({ show: true, message: 'Ngày sinh không hợp lệ' });
    }
    try {
      const payload = { ...form };
      if (!editId) {
        payload.password = form.phoneNumber;
      }
      if (editId) {
        await api.put(`/users/${editId}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setModal(false);
      fetchUsers();
    } catch (err) {
      setError({ show: true, message: err.response?.data?.error || 'Lỗi hệ thống' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setConfirmDeleteId(null);
      fetchUsers();
      setShowSuccess(true);
    } catch (err) { 
      setError({ show: true, message: 'Không thể xóa tài khoản này' }); 
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filtered = users.filter(u =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.phoneNumber?.includes(search)
  );

  const columns = [
    { key: '_index', label: 'ID', render: (v, row, idx) => idx + 1 },
    { key: 'fullName', label: 'Tên' },
    { key: 'gender', label: 'Giới tính', render: (v) => v === 'Male' ? 'Nam' : 'Nữ' },
    { key: 'dateOfBirth', label: 'Ngày sinh', render: (v) => formatDate(v) },
    { key: 'phoneNumber', label: 'SĐT' },
    { key: 'role', label: 'Vai trò', render: (v) => (
      <span className={`role-badge ${v === 'TRAINER' ? 'role-pt' : 'role-member'}`}>
        {v === 'TRAINER' ? 'PT' : 'Hội viên'}
      </span>
    )},
    { key: 'status', label: 'Trạng thái', render: (v) => (
      <span className={`status-badge ${v === 'Active' ? 'status-active' : 'status-inactive'}`}>
        {v === 'Active' ? 'Active' : 'Inactive'}
      </span>
    )}
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý tài khoản</h1>
          <p className="page-subtitle">Danh sách tài khoản có tại phòng tập</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><AddIcon /> Thêm mới</button>
      </div>

      <div className="search-bar">
        <input className="input" placeholder="Tìm kiếm tài khoản..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        renderActions={(row) => (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="action-btn" onClick={() => openEdit(row)} title="Sửa"><img src={editIcon} alt="edit" style={{ width: 20, height: 20 }} /></button>
            <button className="action-btn" onClick={() => setConfirmDeleteId(row._id)} title="Xóa"><img src={deleteIcon} alt="delete" style={{ width: 20, height: 20 }} /></button>
          </div>
        )}
      />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input className="input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required minLength={2} maxLength={50} />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input className="input" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} required maxLength={10} pattern="[0-9]{10}"/>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Giới tính</label>
              <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ngày sinh</label>
              <input className="input" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return getLocalDateString(d); })()} min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 100); return getLocalDateString(d); })()} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Vai trò</label>
              <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="MEMBER">Hội viên</option>
                <option value="TRAINER">PT</option>
              </select>
            </div>
            {editId ? (
              <div className="form-group">
                <label>Trạng thái</label>
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            ) : (
              <div className="form-group"></div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">{editId ? 'Cập nhật' : 'Thêm mới'}</button>
          </div>
        </form>
      </Modal>

      <style>{`
        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .action-btn:hover { opacity: 1; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
        .role-badge {
          width: 90px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 18px;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
        }
        .role-pt { background: #5b5bf8; }
        .role-member { background: #7ea1ee; }
        .status-badge {
          width: 90px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 18px;
          border-radius: 5px;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
        }
        .status-active { background: #2563eb; }
        .status-inactive { background: #dc2626; }
      `}</style>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
        title="Xác nhận xoá?"
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Thành công"
      />

      <ErrorModal
        isOpen={error.show}
        onClose={() => setError({ ...error, show: false })}
        message={error.message}
      />
    </div>
  );
}

export default UserAccountPage;
