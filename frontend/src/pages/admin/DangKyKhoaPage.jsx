import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import DataTable from '../../components/DataTable';

function DangKyKhoaPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pts, setPts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ hoiVienId: '', khoaTapId: '', ptId: '', ngayDangKy: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [eRes, uRes, cRes] = await Promise.all([
        api.get('/dang-ky-khoa-tap'),
        api.get('/users'),
        api.get('/khoa-tap')
      ]);
      setEnrollments(eRes.data);
      const allUsers = uRes.data;
      setUsers(allUsers.filter(u => u.vaiTro === 'HOIVIEN'));
      setPts(allUsers.filter(u => u.vaiTro === 'PT'));
      setCourses(cRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ hoiVienId: '', khoaTapId: '', ptId: '', ngayDangKy: new Date().toISOString().slice(0, 10) });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const course = courses.find(c => c._id === form.khoaTapId);
      await api.post('/dang-ky-khoa-tap', {
        ...form,
        soBuoiConLai: course?.soBuoi || 0
      });
      setModal(false);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/dang-ky-khoa-tap/${id}`);
      setConfirmDeleteId(null);
      fetchAll();
    } catch (err) { alert('Không thể xóa'); }
  };

  const filtered = enrollments.filter(e => {
    const q = search.toLowerCase();
    return (
      e.hoiVienId?.hoTen?.toLowerCase().includes(q) ||
      e.khoaTapId?.tenKhoaTap?.toLowerCase().includes(q) ||
      e.ptId?.hoTen?.toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: 'hoiVienId', label: 'Hội viên', render: (v) => v?.hoTen || '—' },
    { key: 'khoaTapId', label: 'Khóa tập', render: (v) => v?.tenKhoaTap || '—' },
    { key: 'ptId', label: 'PT phụ trách', render: (v) => v?.hoTen || '—' },
    { key: 'soBuoiConLai', label: 'Buổi còn lại', render: (v) => (
      <span className="badge badge-active">{v}</span>
    )},
    { key: 'ngayDangKy', label: 'Ngày đăng ký', render: (v) => v ? new Date(v).toLocaleDateString('vi-VN') : '—' }
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý đăng ký khoá</h1>
          <p className="page-subtitle">Danh sách đăng ký khoá tập của hội viên</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Thêm mới</button>
      </div>

      <div className="search-bar">
        <input className="input" placeholder="Tìm kiếm (tên hội viên, khóa tập, PT)..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <DataTable columns={columns} data={filtered} onDelete={(id) => setConfirmDeleteId(id)} />

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Thêm đăng ký khóa tập">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hội viên</label>
            <select className="input" value={form.hoiVienId} onChange={e => setForm({ ...form, hoiVienId: e.target.value })} required>
              <option value="">-- Chọn hội viên --</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.hoTen} ({u.soDienThoai})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Khóa tập</label>
            <select className="input" value={form.khoaTapId} onChange={e => setForm({ ...form, khoaTapId: e.target.value })} required>
              <option value="">-- Chọn khóa tập --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.tenKhoaTap} ({c.soBuoi} buổi)</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>PT phụ trách</label>
            <select className="input" value={form.ptId} onChange={e => setForm({ ...form, ptId: e.target.value })} required>
              <option value="">-- Chọn PT --</option>
              {pts.map(p => <option key={p._id} value={p._id}>{p.hoTen}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Ngày đăng ký</label>
            <input className="input" type="date" value={form.ngayDangKy} onChange={e => setForm({ ...form, ngayDangKy: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">Thêm mới</button>
          </div>
        </form>
      </Modal>

      <style>{`
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
      `}</style>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
        title="Xóa đăng ký"
        message="Bạn có chắc chắn muốn xóa đăng ký này? Hành động này không thể hoàn tác."
      />
    </div>
  );
}

export default DangKyKhoaPage;
