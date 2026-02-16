const GioTap = require('../models/GioTap');

// GET /api/gio-tap
exports.getAll = async (req, res, next) => {
  try {
    const { ngayTapId } = req.query;
    const filter = ngayTapId ? { ngayTapId } : {};
    const slots = await GioTap.find(filter).populate('ngayTapId').sort({ gioBatDau: 1 });
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

// POST /api/gio-tap
exports.create = async (req, res, next) => {
  try {
    const slot = await GioTap.create(req.body);
    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('slotCreated', slot);
    res.status(201).json(slot);
  } catch (error) {
    next(error);
  }
};

// PUT /api/gio-tap/:id
exports.update = async (req, res, next) => {
  try {
    const slot = await GioTap.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('slotStatusChanged', slot);
    res.json(slot);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/gio-tap/:id
exports.remove = async (req, res, next) => {
  try {
    const slot = await GioTap.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ error: 'Không tìm thấy khung giờ' });
    res.json({ message: 'Xóa khung giờ thành công' });
  } catch (error) {
    next(error);
  }
};
