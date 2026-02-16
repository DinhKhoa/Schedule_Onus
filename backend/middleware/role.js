const role = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa xác thực' });
    }

    if (!allowedRoles.includes(req.user.vaiTro)) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    next();
  };
};

module.exports = role;
