import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/SuccessModal';

function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const { data } = await api.get('/lich-tap');
      const found = data.find(b => b._id === id);
      setBooking(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteClick = () => {
    setErrorMsg('');
    setConfirmOpen(true);
  };

  const handleCompleteConfirm = async () => {
    const originalBooking = { ...booking };
    setConfirmOpen(false);

    // 1. Optimistic Update (Đánh dấu hoàn thành ngay lập tức)
    setBooking(prev => ({ 
      ...prev, 
      trangThai: 'DaHoanThanh',
      dangKyKhoaTapId: {
        ...prev.dangKyKhoaTapId,
        soBuoiConLai: (prev.dangKyKhoaTapId?.soBuoiConLai || 1) - 1
      }
    }));

    try {
      await api.put(`/lich-tap/${id}/complete`);
      setSuccessOpen(true);
      fetchBooking();
    } catch (err) {
      // Rollback
      setBooking(originalBooking);
      setErrorMsg(err.response?.data?.error || 'Không thể hoàn thành buổi tập');
    }
  };

  const statusLabels = { DaDat: 'Chờ tập', DaHoanThanh: 'Đã hoàn thành', DaHuy: 'Đã hủy' };
  const statusColors = { DaDat: '#F59E0B', DaHoanThanh: '#22C55E', DaHuy: '#EF4444' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;
  if (!booking) return <div style={{ padding: 40, textAlign: 'center', color: '#EF4444' }}>Không tìm thấy buổi tập</div>;

  const details = [
    { label: 'Hội viên', value: booking.dangKyKhoaTapId?.hoiVienId?.hoTen || '—', icon: '👤' },
    { label: 'Số điện thoại', value: booking.dangKyKhoaTapId?.hoiVienId?.soDienThoai || '—', icon: '📱' },
    { label: 'Ngày tập', value: booking.ngayTapId?.ngay ? (() => { const d = new Date(booking.ngayTapId.ngay); return `${d.toLocaleDateString('vi-VN', { weekday: 'long' })} - ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })() : '—', icon: '📅' },
    { label: 'Khung giờ', value: `${booking.gioTapId?.gioBatDau || ''} - ${booking.gioTapId?.gioKetThuc || ''}`, icon: '🕐' },
    { label: 'Khóa tập', value: booking.dangKyKhoaTapId?.khoaTapId?.tenKhoaTap || '—', icon: '📋' },
    { label: 'Buổi còn lại', value: booking.dangKyKhoaTapId?.soBuoiConLai ?? '—', icon: '🎯' }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-outline" onClick={() => navigate('/pt')} style={{ marginBottom: 12 }}>
            ← Quay lại
          </button>
          <h1 className="page-title">Chi tiết buổi tập</h1>
        </div>
        <span className="badge" style={{ background: (statusColors[booking.trangThai] || '#6B7280') + '20', color: statusColors[booking.trangThai] || '#6B7280', fontSize: 14, padding: '6px 16px' }}>
          {statusLabels[booking.trangThai]}
        </span>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="card" style={{ textAlign: 'center', padding: 16, color: '#DC2626', marginBottom: 16, background: '#FEF2F2', border: '1px solid #FECACA', maxWidth: 560 }}>
          {errorMsg}
        </div>
      )}

      <div className="detail-container">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, padding: '20px 24px 0', marginBottom: 0 }}>Thông tin buổi tập</h3>
          {details.map((d, i) => (
            <div key={d.label} className="detail-row" style={i === details.length - 1 ? { borderBottom: 'none' } : {}}>
              <span className="detail-icon">{d.icon}</span>
              <span className="detail-label">{d.label}</span>
              <span className="detail-value">{d.value}</span>
            </div>
          ))}
        </div>

        {booking.trangThai === 'DaDat' && (
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary" onClick={handleCompleteClick} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
              ✅ Xác nhận hoàn thành buổi tập
            </button>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCompleteConfirm}
        title="Xác nhận hoàn thành"
        message={`Xác nhận hoàn thành buổi tập cho hội viên ${booking.dangKyKhoaTapId?.hoiVienId?.hoTen || ''}? Số buổi còn lại của gói tập sẽ bị trừ đi 1.`}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Hoàn thành!"
        message="Buổi tập đã được xác nhận hoàn thành. Số buổi còn lại đã được cập nhật."
      />

      <style>{`
        .detail-container {
          max-width: 560px;
        }
        .detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          border-bottom: 1px solid var(--color-border);
          font-size: 14px;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-icon {
          font-size: 16px;
          width: 24px;
          text-align: center;
        }
        .detail-label {
          color: var(--color-text-light);
          min-width: 120px;
        }
        .detail-value {
          font-weight: 500;
          text-transform: capitalize;
          flex: 1;
          text-align: right;
        }
      `}</style>
    </div>
  );
}

export default SessionDetailPage;
