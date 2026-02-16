import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleComplete = async () => {
    if (!confirm('Xác nhận hoàn thành buổi tập này?')) return;
    try {
      await api.put(`/lich-tap/${id}/complete`);
      alert('Đã xác nhận hoàn thành!');
      fetchBooking();
    } catch (err) {
      alert(err.response?.data?.error || 'Không thể hoàn thành');
    }
  };

  const statusLabels = { DaDat: 'Chờ tập', DaHoanThanh: 'Đã hoàn thành', DaHuy: 'Đã hủy' };
  const statusColors = { DaDat: '#F59E0B', DaHoanThanh: '#22C55E', DaHuy: '#EF4444' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Đang tải...</div>;
  if (!booking) return <div style={{ padding: 40, textAlign: 'center', color: '#EF4444' }}>Không tìm thấy buổi tập</div>;

  const details = [
    { label: 'Hội viên', value: booking.hoiVienId?.hoTen || '—' },
    { label: 'Số điện thoại', value: booking.hoiVienId?.soDienThoai || '—' },
    { label: 'Ngày tập', value: booking.ngayTapId?.ngay ? new Date(booking.ngayTapId.ngay).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
    { label: 'Khung giờ', value: `${booking.gioTapId?.gioBatDau || ''} - ${booking.gioTapId?.gioKetThuc || ''}` },
    { label: 'Khóa tập', value: booking.dangKyKhoaTapId?.khoaTapId?.tenKhoaTap || '—' },
    { label: 'Buổi còn lại', value: booking.dangKyKhoaTapId?.soBuoiConLai ?? '—' }
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

      <div className="detail-container">
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Thông tin buổi tập</h3>
          {details.map(d => (
            <div key={d.label} className="detail-row">
              <span className="detail-label">{d.label}</span>
              <span className="detail-value">{d.value}</span>
            </div>
          ))}
        </div>

        {booking.trangThai === 'DaDat' && (
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary" onClick={handleComplete} style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 15 }}>
              ✅ Xác nhận hoàn thành buổi tập
            </button>
          </div>
        )}
      </div>

      <style>{`
        .detail-container {
          max-width: 560px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid var(--color-border);
          font-size: 14px;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: var(--color-text-light);
        }
        .detail-value {
          font-weight: 500;
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
}

export default SessionDetailPage;
