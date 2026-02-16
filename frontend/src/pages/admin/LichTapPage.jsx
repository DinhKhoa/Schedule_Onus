import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import { socketService } from '../../services/socketService';

function LichTapPage() {
  const [pts, setPts] = useState([]);
  const [selectedPt, setSelectedPt] = useState('');
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [slotForm, setSlotForm] = useState({ ngayTapId: '', gioBatDau: '', gioKetThuc: '' });
  const [dayModal, setDayModal] = useState(false);
  const [dayForm, setDayForm] = useState({ ngay: '', ptId: '' });

  useEffect(() => {
    fetchPts();
    socketService.connect();
    socketService.on('slotUpdated', () => selectedPt && fetchDays(selectedPt));
    return () => { socketService.off('slotUpdated'); };
  }, [selectedPt]);

  const fetchPts = async () => {
    try {
      const { data } = await api.get('/users');
      const ptList = data.filter(u => u.vaiTro === 'PT');
      setPts(ptList);
      if (ptList.length > 0) {
        setSelectedPt(ptList[0]._id);
        fetchDays(ptList[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err) { console.error(err); setLoading(false); }
  };

  const fetchDays = async (ptId) => {
    try {
      const { data } = await api.get(`/ngay-tap?ptId=${ptId}`);
      setDays(data);
      // Fetch slots for each day
      const slotsMap = {};
      await Promise.all(data.map(async (day) => {
        const res = await api.get(`/gio-tap?ngayTapId=${day._id}`);
        slotsMap[day._id] = res.data;
      }));
      setSlots(slotsMap);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleDay = async (day) => {
    try {
      await api.put(`/ngay-tap/${day._id}`, {
        trangThai: day.trangThai === 'HoatDong' ? 'NgungHoatDong' : 'HoatDong'
      });
      fetchDays(selectedPt);
    } catch (err) { alert('Lỗi cập nhật'); }
  };

  const openAddSlot = (dayId) => {
    setSlotForm({ ngayTapId: dayId, gioBatDau: '', gioKetThuc: '' });
    setModal(true);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gio-tap', slotForm);
      setModal(false);
      fetchDays(selectedPt);
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Xóa khung giờ này?')) return;
    try {
      await api.delete(`/gio-tap/${slotId}`);
      fetchDays(selectedPt);
    } catch (err) { alert('Không thể xóa'); }
  };

  const openAddDay = () => {
    setDayForm({ ngay: '', ptId: selectedPt });
    setDayModal(true);
  };

  const handleAddDay = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ngay-tap', dayForm);
      setDayModal(false);
      fetchDays(selectedPt);
    } catch (err) { alert(err.response?.data?.error || 'Lỗi'); }
  };

  const slotStatusLabels = { Trong: 'Trống', DaDat: 'Đã đặt', DaHoanThanh: 'Xong', Tat: 'Tắt' };
  const slotStatusColors = { Trong: '#22C55E', DaDat: '#3B61F0', DaHoanThanh: '#6B7280', Tat: '#D1D5DB' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý khung giờ tập</h1>
          <p className="page-subtitle">Thiết lập và quản lý lịch tập cho từng PT</p>
        </div>
        <button className="btn btn-primary" onClick={openAddDay}>+ Thêm ngày tập</button>
      </div>

      {/* PT selector */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 14, fontWeight: 500, marginRight: 12 }}>Chọn PT:</label>
        <select
          className="input"
          value={selectedPt}
          onChange={e => { setSelectedPt(e.target.value); setLoading(true); fetchDays(e.target.value); }}
          style={{ width: 260, display: 'inline-block' }}
        >
          {pts.map(p => <option key={p._id} value={p._id}>{p.hoTen}</option>)}
        </select>
      </div>

      {/* Days timeline */}
      {days.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: '#6B7280' }}>
          Chưa có ngày tập nào cho PT này
        </div>
      ) : (
        <div className="days-timeline">
          {days.map(day => (
            <div key={day._id} className="day-section">
              <div className="day-header">
                <div>
                  <span className="day-date">
                    {new Date(day.ngay).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span
                    className={`toggle ${day.trangThai === 'HoatDong' ? 'active' : ''}`}
                    onClick={() => toggleDay(day)}
                    style={{ marginLeft: 12, verticalAlign: 'middle' }}
                  />
                </div>
                <button className="btn btn-outline" style={{ fontSize: 13, padding: '6px 14px' }} onClick={() => openAddSlot(day._id)}>
                  + Thêm giờ
                </button>
              </div>

              <div className="slots-row">
                {(slots[day._id] || []).length === 0 ? (
                  <span style={{ color: '#9CA3AF', fontSize: 13 }}>Chưa có khung giờ</span>
                ) : (
                  (slots[day._id] || []).map(slot => (
                    <div key={slot._id} className="admin-slot">
                      <div className="admin-slot-time">
                        {slot.gioBatDau} - {slot.gioKetThuc}
                      </div>
                      <span
                        className="badge"
                        style={{ background: (slotStatusColors[slot.trangThai] || '#6B7280') + '20', color: slotStatusColors[slot.trangThai] || '#6B7280' }}
                      >
                        {slotStatusLabels[slot.trangThai]}
                      </span>
                      <button className="action-btn" onClick={() => handleDeleteSlot(slot._id)} title="Xóa">🗑️</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add slot modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Thêm khung giờ tập">
        <form onSubmit={handleAddSlot}>
          <div className="form-group">
            <label>Giờ bắt đầu</label>
            <input className="input" type="time" value={slotForm.gioBatDau} onChange={e => setSlotForm({ ...slotForm, gioBatDau: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Giờ kết thúc</label>
            <input className="input" type="time" value={slotForm.gioKetThuc} onChange={e => setSlotForm({ ...slotForm, gioKetThuc: e.target.value })} required />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">Thêm</button>
          </div>
        </form>
      </Modal>

      {/* Add day modal */}
      <Modal isOpen={dayModal} onClose={() => setDayModal(false)} title="Thêm ngày tập">
        <form onSubmit={handleAddDay}>
          <div className="form-group">
            <label>Ngày</label>
            <input className="input" type="date" value={dayForm.ngay} onChange={e => setDayForm({ ...dayForm, ngay: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>PT phụ trách</label>
            <select className="input" value={dayForm.ptId} onChange={e => setDayForm({ ...dayForm, ptId: e.target.value })} required>
              {pts.map(p => <option key={p._id} value={p._id}>{p.hoTen}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setDayModal(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">Thêm</button>
          </div>
        </form>
      </Modal>

      <style>{`
        .days-timeline {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .day-section {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px;
        }
        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .day-date {
          font-weight: 600;
          font-size: 15px;
          text-transform: capitalize;
        }
        .slots-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .admin-slot {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: var(--color-bg);
          border-radius: var(--radius);
          border: 1px solid var(--color-border);
        }
        .admin-slot-time {
          font-weight: 600;
          font-size: 14px;
        }
        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 2px 4px;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        .action-btn:hover { opacity: 1; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
      `}</style>
    </div>
  );
}

export default LichTapPage;
