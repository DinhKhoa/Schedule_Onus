const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID không hợp lệ' });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];

    const customMessages = {
      gioTapId: 'Lịch tập bị trùng: Khung giờ này đã được đăng ký hoặc thiết lập từ trước.',
      ngayTapId: 'Lịch tập bị trùng: Ngày hoặc khung giờ này đã tồn tại dữ liệu.',
      soDienThoai: 'Số điện thoại này đã được đăng ký trong hệ thống.',
      taiKhoan: 'Tài khoản này đã tồn tại, vui lòng chọn tài khoản khác.',
      tenKhoaTap: 'Tên khóa tập này đã có trong hệ thống.'
    };

    if (customMessages[field]) {
      return res.status(400).json({ error: customMessages[field] });
    }

    return res.status(400).json({ error: `Dữ liệu '${field}' bị trùng lặp hoặc đã tồn tại.` });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Lỗi server nội bộ'
  });
};

module.exports = errorHandler;
