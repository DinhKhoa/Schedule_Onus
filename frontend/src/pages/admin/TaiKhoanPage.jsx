import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';
import DataTable from '../../components/DataTable';
import editIcon from '../../icon/edit.png';
import deleteIcon from '../../icon/delete.png';

function TaiKhoanPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    hoTen: '', soDienThoai: '', matKhau: '',
    gioiTinh: 'Nam', ngaySinh: '', vaiTro: 'HOIVIEN', trangThai: 'HoatDong'
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

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
    setForm({ hoTen: '', soDienThoai: '', matKhau: '', gioiTinh: 'Nam', ngaySinh: '', vaiTro: 'HOIVIEN', trangThai: 'HoatDong' });
    setModal(true);
  };

  const openEdit = (u) => {
    setEditId(u._id);
    setForm({
      hoTen: u.hoTen, soDienThoai: u.soDienThoai, matKhau: '',
      gioiTinh: u.gioiTinh || 'Nam', ngaySinh: u.ngaySinh ? u.ngaySinh.slice(0, 10) : '',
      vaiTro: u.vaiTro, trangThai: u.trangThai
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hoTen || form.hoTen.trim().length < 2) {
      return alert('Họ tên phải có ít nhất 2 ký tự');
    }
    if (form.hoTen.trim().length > 50) {
      return alert('Họ tên không được quá 50 ký tự');
    }
    if (/\d/.test(form.hoTen)) {
      return alert('Họ tên không được chứa chữ số');
    }
    if (!/^[0-9]{10}$/.test(form.soDienThoai)) {
      return alert('Số điện thoại phải có đúng 10 chữ số');
    }
    if (!form.ngaySinh) {
      return alert('Ngày sinh là bắt buộc');
    }
    const birthDate = new Date(form.ngaySinh);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 18) {
      return alert('Người dùng phải từ 18 tuổi trở lên');
    }
    if (age > 100) {
      return alert('Ngày sinh không hợp lệ');
    }
    if (!editId && (!form.matKhau || form.matKhau.length < 6)) {
      return alert('Mật khẩu phải có ít nhất 6 ký tự');
    }
    if (editId && form.matKhau && form.matKhau.length < 6) {
      return alert('Mật khẩu phải có ít nhất 6 ký tự');
    }
    try {
      const payload = { ...form };
      if (editId && !payload.matKhau) delete payload.matKhau;
      if (editId) {
        await api.put(`/users/${editId}`, payload);
      } else {
        await api.post('/users', payload);
      }
      setModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setConfirmDeleteId(null);
      fetchUsers();
      setShowSuccess(true);
    } catch (err) { alert('Không thể xóa'); }
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
    u.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
    u.soDienThoai?.includes(search)
  );

  const columns = [
    { key: '_index', label: 'ID', render: (v, row, idx) => idx + 1 },
    { key: 'hoTen', label: 'Tên' },
    { key: 'gioiTinh', label: 'Giới tính' },
    { key: 'ngaySinh', label: 'Ngày sinh', render: (v) => formatDate(v) },
    { key: 'soDienThoai', label: 'SĐT' },
    { key: 'vaiTro', label: 'Vai trò', render: (v) => (
      <span className={`role-badge ${v === 'PT' ? 'role-pt' : 'role-member'}`}>
        {v === 'PT' ? 'PT' : 'Hội viên'}
      </span>
    )},
    { key: 'trangThai', label: 'Trạng thái', render: (v) => (
      <span className={`status-badge ${v === 'HoatDong' ? 'status-active' : 'status-inactive'}`}>
        {v === 'HoatDong' ? 'Active' : 'Inactive'}
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
        <button className="btn btn-primary" onClick={openAdd}>+ Thêm mới</button>
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
            <label>Họ tên (2-50 ký tự, không chứa số)</label>
            <input className="input" value={form.hoTen} onChange={e => setForm({ ...form, hoTen: e.target.value })} required minLength={2} maxLength={50} />
          </div>
          <div className="form-group">
            <label>Số điện thoại (10 chữ số)</label>
            <input className="input" value={form.soDienThoai} onChange={e => setForm({ ...form, soDienThoai: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} required maxLength={10} pattern="[0-9]{10}" placeholder="VD: 0901000001" />
          </div>
          <div className="form-group">
            <label>{editId ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu (ít nhất 6 ký tự)'}</label>
            <input className="input" type="password" value={form.matKhau} onChange={e => setForm({ ...form, matKhau: e.target.value })} {...(!editId && { required: true })} minLength={6} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Giới tính</label>
              <select className="input" value={form.gioiTinh} onChange={e => setForm({ ...form, gioiTinh: e.target.value })}>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ngày sinh (≥ 18 tuổi)</label>
              <input className="input" type="date" value={form.ngaySinh} onChange={e => setForm({ ...form, ngaySinh: e.target.value })} required max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d.toISOString().slice(0, 10); })()} min={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 100); return d.toISOString().slice(0, 10); })()} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Vai trò</label>
              <select className="input" value={form.vaiTro} onChange={e => setForm({ ...form, vaiTro: e.target.value })}>
                <option value="HOIVIEN">Hội viên</option>
                <option value="PT">PT</option>
              </select>
            </div>
            <div className="form-group">
              <label>Trạng thái</label>
              <select className="input" value={form.trangThai} onChange={e => setForm({ ...form, trangThai: e.target.value })}>
                <option value="HoatDong">Active</option>
                <option value="NgungHoatDong">Inactive</option>
              </select>
            </div>
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
    </div>
  );
}

export default TaiKhoanPage;
