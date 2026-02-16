import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
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
    // Client-side validation
    if (!/^[0-9]{10}$/.test(form.soDienThoai)) {
      return alert('Số điện thoại phải có đúng 10 chữ số');
    }
    if (!form.ngaySinh) {
      return alert('Ngày sinh là bắt buộc');
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
    } catch (err) { alert('Không thể xóa'); }
  };

  const filtered = users.filter(u =>
    u.hoTen?.toLowerCase().includes(search.toLowerCase()) ||
    u.soDienThoai?.includes(search)
  );

  const columns = [
    { key: 'hoTen', label: 'Họ tên' },
    { key: 'soDienThoai', label: 'Số điện thoại' },
    { key: 'vaiTro', label: 'Vai trò', render: (v) => (
      <span className={`badge ${v === 'PT' ? 'badge-pt' : 'badge-member'}`}>
        {v === 'PT' ? 'PT' : 'Hội viên'}
      </span>
    )},
    { key: 'gioiTinh', label: 'Giới tính' },
    { key: 'trangThai', label: 'Trạng thái', render: (v) => (
      <span className={`badge ${v === 'HoatDong' ? 'badge-active' : ''}`} style={v !== 'HoatDong' ? { background: '#FEE2E2', color: '#DC2626' } : {}}>
        {v === 'HoatDong' ? 'Hoạt động' : 'Ngưng'}
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
        <input className="input" placeholder="Tìm kiếm (tên, SĐT)..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        renderActions={(row) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="action-btn" onClick={() => openEdit(row)} title="Sửa"><img src={editIcon} alt="edit" style={{ width: 20, height: 20 }} /></button>
            <button className="action-btn" onClick={() => setConfirmDeleteId(row._id)} title="Xóa"><img src={deleteIcon} alt="delete" style={{ width: 20, height: 20 }} /></button>
          </div>
        )}
      />

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ tên</label>
            <input className="input" value={form.hoTen} onChange={e => setForm({ ...form, hoTen: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Số điện thoại (10 chữ số)</label>
            <input className="input" value={form.soDienThoai} onChange={e => setForm({ ...form, soDienThoai: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })} required maxLength={10} pattern="[0-9]{10}" placeholder="VD: 0901000001" />
          </div>
          <div className="form-group">
            <label>{editId ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu'}</label>
            <input className="input" type="password" value={form.matKhau} onChange={e => setForm({ ...form, matKhau: e.target.value })} {...(!editId && { required: true })} />
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
              <label>Ngày sinh</label>
              <input className="input" type="date" value={form.ngaySinh} onChange={e => setForm({ ...form, ngaySinh: e.target.value })} required />
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
                <option value="HoatDong">Hoạt động</option>
                <option value="NgungHoatDong">Ngưng hoạt động</option>
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
          padding: 4px 6px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .action-btn:hover { opacity: 1; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
      `}</style>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
        title="Xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}

export default TaiKhoanPage;
