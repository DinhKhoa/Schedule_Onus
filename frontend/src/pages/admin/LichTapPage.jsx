import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import SuccessModal from '../../components/SuccessModal';
import { socketService } from '../../services/socketService';
import deleteIcon from '../../icon/delete.png';

function LichTapPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(false);

  // Add slot modal
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ ngayTapId: '', gioBatDau: '', gioKetThuc: '', applyToAll: false });

  // Delete modal
  const [deleteSlot, setDeleteSlot] = useState(null);
  const [deleteAll, setDeleteAll] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Thành công');

  // Min date = tomorrow
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    socketService.connect();
    socketService.on('slotUpdated', () => selectedDate && fetchDayData(selectedDate));
    socketService.on('slotCreated', () => selectedDate && fetchDayData(selectedDate));
    return () => { socketService.off('slotUpdated'); socketService.off('slotCreated'); };
  }, [selectedDate]);

  const fetchDayData = async (date) => {
    if (!date) return;
    setLoading(true);
    try {
      // Fetch all days for this date (across all PTs)
      const { data: dayList } = await api.get(`/ngay-tap?ngay=${date}`);
      setDays(dayList);

      // Fetch slots for each day
      const slotsMap = {};
      await Promise.all(dayList.map(async (day) => {
        const res = await api.get(`/gio-tap?ngayTapId=${day._id}`);
        slotsMap[day._id] = res.data;
      }));
      setSlots(slotsMap);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) fetchDayData(date);
    else { setDays([]); setSlots({}); }
  };

  const toggleDay = async (day) => {
    try {
      await api.put(`/ngay-tap/${day._id}`, {
        trangThai: day.trangThai === 'HoatDong' ? 'Tat' : 'HoatDong'
      });
      fetchDayData(selectedDate);
    } catch (err) { alert('Lỗi cập nhật trạng thái ngày'); }
  };

  const toggleSlot = async (slotId) => {
    try {
      await api.put(`/gio-tap/${slotId}/toggle`);
      fetchDayData(selectedDate);
    } catch (err) { alert(err.response?.data?.error || 'Lỗi cập nhật trạng thái'); }
  };

  const openAddSlot = (dayId) => {
    setAddForm({ ngayTapId: dayId, gioBatDau: '', gioKetThuc: '', applyToAll: false });
    setAddModal(true);
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gio-tap', {
        gioBatDau: addForm.gioBatDau,
        gioKetThuc: addForm.gioKetThuc,
        ngayTapId: addForm.ngayTapId,
        applyToAll: addForm.applyToAll
      });
      setAddModal(false);
      fetchDayData(selectedDate);
      setSuccessMessage(addForm.applyToAll ? 'Đã thêm cho tất cả các ngày' : 'Thêm thành công');
      setShowSuccess(true);
    } catch (err) { alert(err.response?.data?.error || 'Lỗi thêm khung giờ'); }
  };

  const openDeleteModal = (slot) => {
    setDeleteSlot(slot);
    setDeleteAll(false);
  };

  const handleDeleteSlot = async () => {
    if (!deleteSlot) return;
    try {
      await api.delete(`/gio-tap/${deleteSlot._id}?deleteAll=${deleteAll}`);
      setDeleteSlot(null);
      fetchDayData(selectedDate);
      setSuccessMessage(deleteAll ? 'Đã xóa từ tất cả các ngày' : 'Xóa thành công');
      setShowSuccess(true);
    } catch (err) { alert(err.response?.data?.error || 'Không thể xóa'); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getWeekday = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', { weekday: 'long' });
  };

  const slotStatusLabels = { Trong: 'Trống', DaDat: 'Đã đặt', DaHoanThanh: 'Xong', Tat: 'Tắt' };
  const slotStatusColors = { Trong: '#22C55E', DaDat: '#3B61F0', DaHoanThanh: '#6B7280', Tat: '#D1D5DB' };

  // Combine all slots from all days into one flat list for grid display
  const allSlots = days.flatMap(day =>
    (slots[day._id] || []).map(slot => ({ ...slot, day }))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý khung giờ tập</h1>
          <p className="page-subtitle">Thiết lập và quản lý trạng thái lịch tập</p>
        </div>
        {days.length > 0 && (
          <button className="btn btn-primary" onClick={() => openAddSlot(days[0]._id)}>+ Thêm mới</button>
        )}
      </div>

      {/* Date picker */}
      <div className="date-picker-section">
        <label className="date-label">Chọn ngày cần quản lý</label>
        <input
          className="input date-input"
          type="date"
          value={selectedDate}
          min={getTomorrow()}
          onChange={e => handleDateChange(e.target.value)}
        />
      </div>

      {!selectedDate ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>Vui lòng chọn ngày để xem lịch tập</p>
        </div>
      ) : loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>
      ) : days.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>Chưa có ngày tập nào cho ngày {formatDate(selectedDate)}</p>
        </div>
      ) : (
        <>
          {/* Day status sections */}
          {days.map(day => (
            <div key={day._id} className="day-status-card">
              <div className="day-status-row">
                <div className="day-info">
                  <span className="day-date-label">{getWeekday(day.ngay)} - {formatDate(day.ngay)}</span>
                  {day.ptId && <span className="pt-name">PT: {day.ptId.hoTen}</span>}
                </div>
                <div className="day-toggle-area">
                  <span className="toggle-label">{day.trangThai === 'HoatDong' ? 'Hoạt động' : 'Tắt'}</span>
                  <span
                    className={`toggle ${day.trangThai === 'HoatDong' ? 'active' : ''}`}
                    onClick={() => toggleDay(day)}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Slot grid */}
          <div className="slot-grid-title">Khung giờ tập ({allSlots.length})</div>
          {allSlots.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <p>Chưa có khung giờ nào</p>
            </div>
          ) : (
            <div className="slot-grid">
              {allSlots.map(slot => (
                <div key={slot._id} className={`slot-card ${slot.trangThai === 'Tat' ? 'slot-disabled' : ''}`}>
                  <div className="slot-time">{slot.gioBatDau} - {slot.gioKetThuc}</div>
                  <div className="slot-bottom">
                    <span
                      className="slot-status-badge"
                      style={{ background: (slotStatusColors[slot.trangThai] || '#6B7280') + '20', color: slotStatusColors[slot.trangThai] || '#6B7280' }}
                    >
                      {slotStatusLabels[slot.trangThai]}
                    </span>
                    <div className="slot-actions">
                      {(slot.trangThai === 'Trong' || slot.trangThai === 'Tat') && (
                        <span
                          className={`toggle toggle-sm ${slot.trangThai === 'Trong' ? 'active' : ''}`}
                          onClick={() => toggleSlot(slot._id)}
                          title={slot.trangThai === 'Trong' ? 'Tắt' : 'Bật'}
                        />
                      )}
                      <button className="action-btn" onClick={() => openDeleteModal(slot)} title="Xóa">
                        <img src={deleteIcon} alt="delete" style={{ width: 18, height: 18 }} />
                      </button>
                    </div>
                  </div>
                  {slot.day?.ptId && <div className="slot-pt">PT: {slot.day.ptId.hoTen}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add slot modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Thêm khung giờ tập">
        <form onSubmit={handleAddSlot}>
          <div className="form-group">
            <label>Giờ bắt đầu</label>
            <input className="input" type="time" value={addForm.gioBatDau} onChange={e => setAddForm({ ...addForm, gioBatDau: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Giờ kết thúc</label>
            <input className="input" type="time" value={addForm.gioKetThuc} onChange={e => setAddForm({ ...addForm, gioKetThuc: e.target.value })} required />
          </div>
          <div className="form-group">
            <label style={{ marginBottom: 10, fontWeight: 600 }}>Phạm vi áp dụng</label>
            <div className="radio-group">
              <label className="radio-option">
                <input type="radio" name="scope" checked={!addForm.applyToAll} onChange={() => setAddForm({ ...addForm, applyToAll: false })} />
                <span>Chỉ ngày này</span>
              </label>
              <label className="radio-option">
                <input type="radio" name="scope" checked={addForm.applyToAll} onChange={() => setAddForm({ ...addForm, applyToAll: true })} />
                <span>Tất cả các ngày</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={() => setAddModal(false)}>Hủy</button>
            <button type="submit" className="btn btn-primary">Thêm</button>
          </div>
        </form>
      </Modal>

      {/* Custom delete modal with scope */}
      {deleteSlot && (
        <div className="confirm-overlay" onClick={() => setDeleteSlot(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <button className="confirm-close-btn" onClick={() => setDeleteSlot(null)}>✕</button>
            <h3 className="confirm-title">Xóa khung giờ?</h3>
            <p className="confirm-message">Khung giờ: <strong>{deleteSlot.gioBatDau} - {deleteSlot.gioKetThuc}</strong></p>
            <div className="radio-group" style={{ margin: '16px 0' }}>
              <label className="radio-option">
                <input type="radio" name="deleteScope" checked={!deleteAll} onChange={() => setDeleteAll(false)} />
                <span>Sự kiện này</span>
              </label>
              <label className="radio-option">
                <input type="radio" name="deleteScope" checked={deleteAll} onChange={() => setDeleteAll(true)} />
                <span>Tất cả sự kiện</span>
              </label>
            </div>
            <div className="confirm-actions">
              <button className="confirm-btn confirm-btn-cancel" onClick={() => setDeleteSlot(null)}>Hủy</button>
              <button className="confirm-btn confirm-btn-delete" onClick={handleDeleteSlot}>Xoá</button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />

      <style>{`
        .date-picker-section {
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .date-label {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        .date-input {
          width: 220px;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          color: #6B7280;
        }
        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }
        .day-status-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          margin-bottom: 16px;
        }
        .day-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .day-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .day-date-label {
          font-weight: 600;
          font-size: 15px;
          text-transform: capitalize;
        }
        .pt-name {
          font-size: 13px;
          color: #6B7280;
        }
        .day-toggle-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .toggle-label {
          font-size: 13px;
          color: #6B7280;
        }
        .slot-grid-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #374151;
        }
        .slot-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .slot-card {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          padding: 14px 16px;
          transition: box-shadow 0.2s;
        }
        .slot-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .slot-disabled {
          opacity: 0.5;
        }
        .slot-time {
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 10px;
        }
        .slot-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .slot-status-badge {
          display: inline-block;
          padding: 3px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .slot-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .slot-pt {
          font-size: 12px;
          color: #9CA3AF;
          margin-top: 6px;
        }
        .toggle-sm {
          transform: scale(0.8);
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
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .radio-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }
        .radio-option input[type="radio"] {
          accent-color: #2563eb;
          width: 16px;
          height: 16px;
        }

        /* Delete modal styles */
        .confirm-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .confirm-box {
          background: white;
          border-radius: 12px;
          padding: 28px 32px;
          min-width: 360px;
          max-width: 440px;
          position: relative;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .confirm-close-btn {
          position: absolute;
          top: 12px; right: 14px;
          background: none;
          border: none;
          font-size: 18px;
          color: #9ca3af;
          cursor: pointer;
        }
        .confirm-title {
          font-size: 17px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .confirm-message {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 4px;
        }
        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 16px;
        }
        .confirm-btn {
          padding: 8px 22px;
          border-radius: 6px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .confirm-btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }
        .confirm-btn-delete {
          background: #2563eb;
          color: white;
        }

        @media (max-width: 900px) {
          .slot-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .slot-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default LichTapPage;
