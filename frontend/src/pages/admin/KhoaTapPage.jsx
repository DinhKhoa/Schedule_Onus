import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';

function KhoaTapPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ tenKhoaTap: '', soBuoi: '' });

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
    if (!confirm('Bạn có chắc muốn xóa khóa tập này?')) return;
    try {
      await api.delete(`/khoa-tap/${id}`);
      fetchCourses();
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
              <div className="course-icon">📋</div>
              <div className="course-actions">
                <button className="action-btn" onClick={() => openEdit(c)} title="Sửa">✏️</button>
                <button className="action-btn" onClick={() => handleDelete(c._id)} title="Xóa">🗑️</button>
              </div>
            </div>
            <h3 className="course-name">{c.tenKhoaTap}</h3>
            <div className="course-sessions">
              <span className="session-badge">{c.soBuoi} buổi</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Chỉnh sửa khóa tập' : 'Thêm khóa tập'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên khóa tập</label>
            <input className="input" value={form.tenKhoaTap} onChange={e => setForm({ ...form, tenKhoaTap: e.target.value })} required placeholder="VD: Yoga, Pilates..." />
          </div>
          <div className="form-group">
            <label>Số buổi</label>
            <input className="input" type="number" min="1" value={form.soBuoi} onChange={e => setForm({ ...form, soBuoi: e.target.value })} required placeholder="VD: 10" />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">{editId ? 'Cập nhật' : 'Thêm mới'}</button>
          </div>
        </form>
      </Modal>

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
          width: 44px;
          height: 44px;
          background: #EEF2FF;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
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
        .course-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .session-badge {
          background: #D1FAE5;
          color: #059669;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
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
