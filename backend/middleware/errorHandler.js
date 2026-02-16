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
    const fieldLabels = {
      soDienThoai: 'Số điện thoại',
      taiKhoan: 'Tài khoản',
      tenKhoaTap: 'Tên khóa tập'
    };
    const label = fieldLabels[field] || field;
    return res.status(400).json({ error: `${label} đã tồn tại trong hệ thống` });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Lỗi server nội bộ'
  });
};

module.exports = errorHandler;
