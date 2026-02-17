import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';
import editIcon from '../../icon/edit.png';
import deleteIcon from '../../icon/delete.png';
import openBookIcon from '../../icon/open-book.png';

function KhoaTapPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ tenKhoaTap: '', soBuoi: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/khoa-tap');
      setCourses(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditId(null); setForm({ tenKhoaTap: '', soBuoi: '' }); setModal(true); };
  const openEdit = (c) => { setEditId(c._id); setForm({ tenKhoaTap: c.tenKhoaTap, soBuoi: c.soBuoi }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenKhoaTap || form.tenKhoaTap.trim().length < 2) {
      return alert('Tên khóa tập phải có ít nhất 2 ký tự');
    }
    if (form.tenKhoaTap.trim().length > 50) {
      return alert('Tên khóa tập không được quá 50 ký tự');
    }
    if (!form.soBuoi || Number(form.soBuoi) < 1 || Number(form.soBuoi) > 40) {
      return alert('Số buổi phải từ 1 đến 40');
    }
    try {
      if (editId) {
        await api.put(`/khoa-tap/${editId}`, form);
      } else {
        await api.post('/khoa-tap', form);
      }
      setModal(false);
      fetchCourses();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/khoa-tap/${id}`);
      setConfirmDeleteId(null);
      fetchCourses();
      setShowSuccess(true);
    } catch (err) { alert(err.response?.data?.error || 'Không thể xóa'); }
  };

  const filtered = courses.filter(c =>
    c.tenKhoaTap?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý khóa tập</h1>
          <p className="page-subtitle">Danh sách các gói tập hiện có tại phòng tập</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Thêm khóa tập</button>
      </div>

      <div className="search-bar">
        <input className="input" placeholder="Tìm kiếm khóa tập..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Course cards */}
      <div className="course-grid">
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B7280', gridColumn: '1 / -1' }}>
            Không có khóa tập nào
          </div>
        ) : filtered.map(c => (
          <div key={c._id} className="course-card">
            <div className="course-card-header">
              <div className="course-icon"><img src={openBookIcon} alt="" style={{ width: 24, height: 24, filter: 'brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1636%) hue-rotate(213deg) brightness(97%) contrast(93%)' }} /></div>
              <div className="course-actions">
                <button className="action-btn" onClick={() => openEdit(c)} title="Sửa"><img src={editIcon} alt="edit" style={{ width: 20, height: 20 }} /></button>
                <button className="action-btn" onClick={() => setConfirmDeleteId(c._id)} title="Xóa"><img src={deleteIcon} alt="delete" style={{ width: 20, height: 20 }} /></button>
              </div>
            </div>
            <div className="course-info-row">
              <h3 className="course-name">{c.tenKhoaTap}</h3>
              <span className="session-count">{c.soBuoi} buổi tập</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Chỉnh sửa khóa tập' : 'Thêm khóa tập mới'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên khóa tập (2-50 ký tự)</label>
            <input className="input" value={form.tenKhoaTap} onChange={e => setForm({ ...form, tenKhoaTap: e.target.value })} required minLength={2} maxLength={50} placeholder="VD: Yoga, Pilates..." />
          </div>
          <div className="form-group">
            <label>Số buổi (1-40)</label>
            <input className="input" type="number" min="1" max="40" value={form.soBuoi} onChange={e => setForm({ ...form, soBuoi: e.target.value })} required placeholder="VD: 10" />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">{editId ? 'Lưu thay đổi' : 'Thêm mới'}</button>
          </div>
        </form>
      </Modal>

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

      <style>{`
        .course-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .course-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          transition: all 0.2s;
        }
        .course-card:hover {
          box-shadow: 0 4px 14px rgba(0,0,0,0.06);
        }
        .course-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .course-icon {
          width: 48px;
          height: 48px;
          background: #eff6ff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .course-actions {
          display: flex;
          gap: 4px;
        }
        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px 6px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .action-btn:hover {
          opacity: 1;
        }
        .course-info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .course-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 0;
        }
        .session-count {
          color: #2563eb;
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

export default KhoaTapPage;
