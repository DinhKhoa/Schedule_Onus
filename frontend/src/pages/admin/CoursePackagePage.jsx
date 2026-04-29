import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';
import ErrorModal from '../../components/ErrorModal';
import { AddIcon } from '../../components/Icons';
import editIcon from '../../icon/edit.png';
import deleteIcon from '../../icon/delete.png';
import openBookIcon from '../../icon/open-book.png';

function CoursePackagePage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', totalSessions: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState({ show: false, message: '' });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/course-package');
      setCourses(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openAdd = () => { setEditId(null); setForm({ name: '', totalSessions: '' }); setModal(true); };
  const openEdit = (c) => { setEditId(c._id); setForm({ name: c.name, totalSessions: c.totalSessions }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.name.trim().length < 2) {
      return setError({ show: true, message: 'Tên khóa tập phải có ít nhất 2 ký tự' });
    }
    if (form.name.trim().length > 50) {
      return setError({ show: true, message: 'Tên khóa tập không được quá 50 ký tự' });
    }
    if (!form.totalSessions || Number(form.totalSessions) < 1 || Number(form.totalSessions) > 40) {
      return setError({ show: true, message: 'Số buổi phải từ 1 đến 40' });
    }
    try {
      if (editId) {
        await api.put(`/course-package/${editId}`, form);
      } else {
        await api.post('/course-package', form);
      }
      setModal(false);
      fetchCourses();
    } catch (err) {
      setError({ show: true, message: err.response?.data?.error || 'Lỗi hệ thống' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/course-package/${id}`);
      setConfirmDeleteId(null);
      fetchCourses();
      setShowSuccess(true);
    } catch (err) { 
      setError({ show: true, message: err.response?.data?.error || 'Không thể xóa khóa tập này' }); 
    }
  };

  const filtered = courses.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý khóa tập</h1>
          <p className="page-subtitle">Danh sách các gói tập hiện có tại phòng tập</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><AddIcon /> Thêm khóa tập</button>
      </div>

      <div className="search-bar">
        <input className="input" placeholder="Tìm kiếm khóa tập..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

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
              <h3 className="course-name">{c.name}</h3>
              <span className="session-count">{c.totalSessions} buổi tập</span>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Chỉnh sửa khóa tập' : 'Thêm khóa tập mới'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên khóa tập</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={50}/>
          </div>
          <div className="form-group">
            <label>Số buổi tập</label>
            <input className="input" type="number" min="1" max="40" value={form.totalSessions} onChange={e => setForm({ ...form, totalSessions: e.target.value })} required/>
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

      <ErrorModal
        isOpen={error.show}
        onClose={() => setError({ ...error, show: false })}
        message={error.message}
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

export default CoursePackagePage;
