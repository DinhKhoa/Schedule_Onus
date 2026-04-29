const TimeSlot = require("../models/TimeSlot");
const TrainingDate = require("../models/TrainingDate");
const Booking = require("../models/Booking");
const Enrollment = require("../models/Enrollment");
const SlotStatus = require("../models/SlotStatus");
const TrainerDayStatus = require("../models/TrainerDayStatus");
const TrainerSlotStatus = require("../models/TrainerSlotStatus");

// GET /api/time-slot
exports.getAll = async (req, res, next) => {
	try {
		const { trainingDateId, memberId, trainerId: trainerIdQuery } = req.query;
		const slots = await TimeSlot.find().sort({ startTime: 1 });
		if (trainingDateId) {
			// Admin request: merge per-day overrides
      const effectiveMemberId = req.user?.role === "MEMBER" ? req.user.id : memberId;
			if (!effectiveMemberId) {
				const overrides = await SlotStatus.find({ trainingDateId });
				const overrideMap = {};
				overrides.forEach(o => { overrideMap[o.timeSlotId.toString()] = o.status; });

				const slotsWithOverride = slots.map(slot => {
					const slotObj = slot.toObject();
					if (overrideMap[slot._id.toString()] !== undefined) {
						slotObj.status = overrideMap[slot._id.toString()];
						slotObj.isOverridden = true; 
					}
					return slotObj;
				});

        if (trainerIdQuery) {
          const dayStatus = await TrainerDayStatus.findOne({ trainerId: trainerIdQuery, trainingDateId });
          const slotStatuses = await TrainerSlotStatus.find({ trainerId: trainerIdQuery, trainingDateId });
          const slotMap = {};
          slotStatuses.forEach(s => { slotMap[s.timeSlotId.toString()] = s.status; });
          return res.json(slotsWithOverride.map(slot => {
            const slotObj = { ...slot };
            slotObj.trainerDayStatus = dayStatus?.status || 'Available';
            slotObj.trainerSlotStatus = slotMap[slot._id.toString()] || 'Available';
            return slotObj;
          }));
        }
				return res.json(slotsWithOverride);
			}

			let relevantEnrollmentIds = [];
			let trainerId = null;
			
			const enrollments = await Enrollment.find({
				$or: [{ memberId: effectiveMemberId }, { trainerId: { $ne: null } }],
			}).select("_id trainerId memberId");

			const myMainEnrollment = await Enrollment.findOne({
				memberId: effectiveMemberId,
				remainingSessions: { $gt: 0 },
			}).sort({ registrationDate: 1, createdAt: 1 });

			if (myMainEnrollment) trainerId = myMainEnrollment.trainerId;

			relevantEnrollmentIds = enrollments
				.filter(
					(e) =>
						e.memberId.toString() === effectiveMemberId ||
						(trainerId && e.trainerId.toString() === trainerId.toString()),
				)
				.map((e) => e._id);

			const bookings =
				relevantEnrollmentIds.length > 0
					? await Booking.find({
							trainingDateId,
							enrollmentId: { $in: relevantEnrollmentIds },
							status: { $in: ["PendingTrainerConfirm", "Booked", "Completed"] },
						}).populate("enrollmentId", "memberId trainerId")
					: [];

      const dayStatus = trainerId ? await TrainerDayStatus.findOne({ trainerId, trainingDateId }) : null;
      const trainerSlotStatuses = trainerId ? await TrainerSlotStatus.find({ trainerId, trainingDateId }) : [];
      const trainerSlotMap = {};
      trainerSlotStatuses.forEach(s => { trainerSlotMap[s.timeSlotId.toString()] = s.status; });

			const slotsWithStatus = slots.map((slot) => {
				const slotObj = slot.toObject();

				// Find if user has a booking here
				const myBooking = bookings.find(
					(b) =>
						b.timeSlotId.toString() === slot._id.toString() &&
						b.enrollmentId &&
						b.enrollmentId.memberId.toString() === effectiveMemberId,
				);

				if (myBooking) {
					slotObj.status = myBooking.status === "Booked" ? "DaDat" : "DaHoanThanh"; // Keep some legacy string for FE if needed, or use English
                    // To be safe and consistent with my English migration:
                    slotObj.status = myBooking.status; 
					slotObj.myBookingId = myBooking._id;
					return slotObj;
				}

				// Find if PT is busy here
				if (trainerId) {
          if (dayStatus?.status === 'Unavailable') {
            slotObj.status = 'Inactive';
            return slotObj;
          }
          if (trainerSlotMap[slot._id.toString()] === 'Unavailable') {
            slotObj.status = 'Inactive';
            return slotObj;
          }
					const ptBusy = bookings.find(
						(b) =>
							b.timeSlotId.toString() === slot._id.toString() &&
							b.enrollmentId &&
							b.enrollmentId.trainerId.toString() === trainerId.toString(),
					);
					if (ptBusy) {
						slotObj.status = "Booked";
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

// POST /api/time-slot
exports.create = async (req, res, next) => {
	try {
		const { startTime, endTime } = req.body;
		const slot = await TimeSlot.create({ startTime, endTime });
		const io = req.app.get("io");
		if (io) io.emit("slotCreated", slot);
		res.status(201).json(slot);
	} catch (error) {
		next(error);
	}
};

// PUT /api/time-slot/:id
exports.update = async (req, res, next) => {
	try {
		const slot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, {
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

// PUT /api/time-slot/:id/toggle
exports.toggle = async (req, res, next) => {
	try {
		const slot = await TimeSlot.findById(req.params.id);
		if (!slot)
			return res.status(404).json({ error: "Không tìm thấy khung giờ" });

		const oldStatus = slot.status;
		const isCurrentlyActive = (oldStatus === "Active");
		const newStatus = isCurrentlyActive ? "Inactive" : "Active";
		
		slot.status = newStatus;
		const savedSlot = await slot.save();

		const io = req.app.get("io");
		if (io) io.emit("slotUpdated", savedSlot);
		res.json(savedSlot);
	} catch (error) {
		next(error);
	}
};

// DELETE /api/time-slot/:id
exports.remove = async (req, res, next) => {
	try {
		const slot = await TimeSlot.findById(req.params.id);
		if (!slot)
			return res.status(404).json({ error: "Không tìm thấy khung giờ" });

		const activeBooking = await Booking.findOne({
			timeSlotId: slot._id,
			status: { $in: ["Booked", "PendingTrainerConfirm"] },
		});
		if (activeBooking) {
			return res
				.status(400)
				.json({ error: "Không thể xóa khung giờ đang có người đặt lịch" });
		}

		await TimeSlot.findByIdAndDelete(req.params.id);
		res.json({ message: "Xóa khung giờ thành công" });
	} catch (error) {
		next(error);
	}
};
