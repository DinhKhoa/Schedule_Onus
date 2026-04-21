const GioTap = require("../models/GioTap");
const NgayTap = require("../models/NgayTap");
const LichTap = require("../models/LichTap");
const DangKyKhoaTap = require("../models/DangKyKhoaTap");
const NgayGioTap = require("../models/NgayGioTap");

// GET /api/gio-tap
exports.getAll = async (req, res, next) => {
	try {
		const { ngayTapId, hoiVienId } = req.query;
		const slots = await GioTap.find().sort({ gioBatDau: 1 });
		if (ngayTapId) {
			// Admin request: merge per-day overrides
			if (!hoiVienId) {
				const overrides = await NgayGioTap.find({ ngayTapId });
				const overrideMap = {};
				overrides.forEach(o => { overrideMap[o.gioTapId.toString()] = o.trangThai; });

				const slotsWithOverride = slots.map(slot => {
					const slotObj = slot.toObject();
					if (overrideMap[slot._id.toString()] !== undefined) {
						slotObj.trangThai = overrideMap[slot._id.toString()];
						slotObj.isOverridden = true; // flag để FE biết đây là override riêng ngày
					}
					return slotObj;
				});
				return res.json(slotsWithOverride);
			}

			let relevantEnrollmentIds = [];
			let ptId = null;
			// 1. Get user's current PT and all their active enrollments
			const enrollments = await DangKyKhoaTap.find({
				$or: [{ hoiVienId }, { ptId: { $ne: null } }],
			}).select("_id ptId hoiVienId");

			const myMainEnrollment = await DangKyKhoaTap.findOne({
				hoiVienId,
				soBuoiConLai: { $gt: 0 },
			}).sort({ ngayDangKy: 1, createdAt: 1 });

			if (myMainEnrollment) ptId = myMainEnrollment.ptId;

			// Filter enrollment IDs that belong to me OR to my PT
			relevantEnrollmentIds = enrollments
				.filter(
					(e) =>
						e.hoiVienId.toString() === hoiVienId ||
						(ptId && e.ptId.toString() === ptId.toString()),
				)
				.map((e) => e._id);

			// 2. Fetch bookings related to my interest (Me or my PT)
			const bookings =
				relevantEnrollmentIds.length > 0
					? await LichTap.find({
							ngayTapId,
							dangKyKhoaTapId: { $in: relevantEnrollmentIds },
							trangThai: { $ne: "DaHuy" },
						}).populate("dangKyKhoaTapId", "hoiVienId ptId")
					: [];

			const slotsWithStatus = slots.map((slot) => {
				const slotObj = slot.toObject();

				// Find if user has a booking here
				const myBooking = bookings.find(
					(b) =>
						b.gioTapId.toString() === slot._id.toString() &&
						b.dangKyKhoaTapId &&
						b.dangKyKhoaTapId.hoiVienId.toString() === hoiVienId,
				);

				if (myBooking) {
					slotObj.trangThai = myBooking.trangThai;
					slotObj.myBookingId = myBooking._id;
					return slotObj;
				}

				// Find if PT is busy here
				if (ptId) {
					const ptBusy = bookings.find(
						(b) =>
							b.gioTapId.toString() === slot._id.toString() &&
							b.dangKyKhoaTapId &&
							b.dangKyKhoaTapId.ptId.toString() === ptId.toString(),
					);
					if (ptBusy) {
						slotObj.trangThai = "DaDat";
						return slotObj;
					}
				}

				return slotObj;
			});
			return res.json(slotsWithStatus);
		}

		res.json(slots);
	} catch (error) {
		next(error);
	}
};

// POST /api/gio-tap
exports.create = async (req, res, next) => {
	try {
		const { gioBatDau, gioKetThuc } = req.body;
		const slot = await GioTap.create({ gioBatDau, gioKetThuc });
		const io = req.app.get("io");
		if (io) io.emit("slotCreated", slot);
		res.status(201).json(slot);
	} catch (error) {
		next(error);
	}
};

// PUT /api/gio-tap/:id
exports.update = async (req, res, next) => {
	try {
		const slot = await GioTap.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!slot)
			return res.status(404).json({ error: "Không tìm thấy khung giờ" });
		const io = req.app.get("io");
		if (io) io.emit("slotStatusChanged", slot);
		res.json(slot);
	} catch (error) {
		next(error);
	}
};

// PUT /api/gio-tap/:id/toggle
exports.toggle = async (req, res, next) => {
	try {
		const slot = await GioTap.findById(req.params.id);
		if (!slot)
			return res.status(404).json({ error: "Không tìm thấy khung giờ" });

		const oldStatus = slot.trangThai;
		const isCurrentlyActive = (oldStatus === "HoatDong" || oldStatus === "Trong");
		const newStatus = isCurrentlyActive ? "NgungHoatDong" : "HoatDong";
		
		slot.trangThai = newStatus;

		const savedSlot = await slot.save();


		const io = req.app.get("io");
		if (io) io.emit("slotUpdated", savedSlot);
		res.json(savedSlot);
	} catch (error) {
		console.error(`❌ Toggle ERROR ${req.params.id}:`, error);
		next(error);
	}
};

// DELETE /api/gio-tap/:id
exports.remove = async (req, res, next) => {
	try {
		const slot = await GioTap.findById(req.params.id);
		if (!slot)
			return res.status(404).json({ error: "Không tìm thấy khung giờ" });

		// Check for ANY active bookings across all days
		const activeBooking = await LichTap.findOne({
			gioTapId: slot._id,
			trangThai: "DaDat",
		});
		if (activeBooking) {
			return res
				.status(400)
				.json({ error: "Không thể xóa khung giờ đang có người đặt lịch" });
		}

		await GioTap.findByIdAndDelete(req.params.id);
		res.json({ message: "Xóa khung giờ thành công" });
	} catch (error) {
		next(error);
	}
};
