import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';
import DataTable from '../../components/DataTable';
import { AddIcon } from '../../components/Icons';
import { getLocalDateString, formatDateVN } from '../../utils/dateUtils';

function EnrollmentPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pts, setPts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ memberId: '', packageId: '', trainerId: '', registrationDate: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [eRes, uRes, cRes] = await Promise.all([
        api.get('/enrollment'),
        api.get('/users'),
        api.get('/course-package')
      ]);
      setEnrollments(eRes.data);
      const allUsers = uRes.data;
      setUsers(allUsers.filter(u => u.role === 'MEMBER'));
      setPts(allUsers.filter(u => u.role === 'TRAINER'));
      setCourses(cRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ memberId: '', packageId: '', trainerId: '', registrationDate: getLocalDateString() });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/enrollment', form);
      setModal(false);
      fetchAll();
    } catch (err) {
      setError({ show: true, message: err.response?.data?.error || 'Lỗi hệ thống' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/enrollment/${id}`);
      fetchAll();
      setShowSuccess(true);
    } catch (err) { 
      setError({ show: true, message: err.response?.data?.error || 'Không thể xóa lượt đăng ký này' }); 
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const formatDate = (dateStr) => formatDateVN(dateStr);

  const filtered = enrollments.filter(e => {
    const q = search.toLowerCase();
    return (
      e.memberId?.fullName?.toLowerCase().includes(q) ||
      e.packageId?.name?.toLowerCase().includes(q) ||
      e.trainerId?.fullName?.toLowerCase().includes(q)
    );
  });

  const columns = [
    { key: '_index', label: 'ID', render: (v, row, idx) => idx + 1 },
    { key: 'memberId', label: 'Tên', render: (v) => v?.fullName || '—' },
    { key: 'packageId', label: 'Khóa tập', render: (v) => v?.name || '—' },
    { key: 'registrationDate', label: 'Ngày đăng ký', render: (v) => formatDate(v) },
    { key: 'totalSessions', label: 'Tổng buổi', render: (v) => v || '—' },
    { key: 'remainingSessions', label: 'Còn lại', render: (v) => v },
    { key: 'trainerId', label: 'Huấn luyện viên', render: (v) => v?.fullName || '—' }
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý đăng ký khoá</h1>
          <p className="page-subtitle">Danh sách đăng ký khoá tập của hội viên</p>
        </div>
                <button className="btn btn-primary" onClick={openAdd}>
          <AddIcon /> Thêm mới
        </button>
      </div>

      <div className="search-bar">
        <input className="input" placeholder="Tìm kiếm (tên hội viên, khóa tập, PT)..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <DataTable columns={columns} data={filtered} onDelete={(id) => setConfirmDeleteId(id)} />

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Thêm đăng ký khóa tập">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hội viên</label>
            <select className="input" value={form.memberId} onChange={e => setForm({ ...form, memberId: e.target.value })} required>
              <option value="">-- Chọn hội viên --</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.fullName} ({u.phoneNumber})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Khóa tập</label>
            <select className="input" value={form.packageId} onChange={e => setForm({ ...form, packageId: e.target.value })} required>
              <option value="">-- Chọn khóa tập --</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.totalSessions} buổi)</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Ngày đăng ký</label>
            <input className="input" type="date" value={form.registrationDate} onChange={e => setForm({ ...form, registrationDate: e.target.value })} required max={getLocalDateString()} />
          </div>
          <div className="form-group">
            <label>PT phụ trách</label>
            <select className="input" value={form.trainerId} onChange={e => setForm({ ...form, trainerId: e.target.value })} required>
              <option value="">-- Chọn PT --</option>
              {pts.map(p => <option key={p._id} value={p._id}>{p.fullName}</option>)}
            </select>
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

export default EnrollmentPage;
