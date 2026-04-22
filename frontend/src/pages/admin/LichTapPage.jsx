import { useState, useEffect } from "react";
import api from "../../services/api";
import Modal from "../../components/Modal";
import SuccessModal from "../../components/SuccessModal";
import { AddIcon } from "../../components/Icons";
import { socketService } from "../../services/socketService";
import deleteIcon from "../../icon/delete.png";
import clockIcon from "../../icon/clock.png";
import onOffIcon from "../../icon/on-off-button.png";

function LichTapPage() {
	const [selectedDate, setSelectedDate] = useState("");
	const [days, setDays] = useState([]);
	const [slots, setSlots] = useState({});
	const [loading, setLoading] = useState(false);

	// Add slot modal
	const [addModal, setAddModal] = useState(false);
	const [addForm, setAddForm] = useState({
		ngayTapId: "",
		gioBatDau: "",
		gioKetThuc: "",
		applyToAll: false,
	});

	// Delete modal
	const [deleteSlot, setDeleteSlot] = useState(null);
	const [deleteAll, setDeleteAll] = useState(false);

	// Toggle slot modal (chọn kiểu tắt)
	const [toggleModal, setToggleModal] = useState(false);
	const [pendingToggleSlot, setPendingToggleSlot] = useState(null); // { _id, trangThai, day }
	const [toggleScope, setToggleScope] = useState("local"); // "local" or "global"

	// Warning state
	const [warning, setWarning] = useState(null);

	const [showSuccess, setShowSuccess] = useState(false);
	const [successMessage, setSuccessMessage] = useState("Thành công");

	const getTomorrow = () => {
		const d = new Date();
		d.setDate(d.getDate() + 1);
		return d.toISOString().slice(0, 10);
	};

	useEffect(() => {
		const today = new Date().toISOString().slice(0, 10);
		handleDateChange(today);
		socketService.connect();
		socketService.on(
			"slotUpdated",
			() => selectedDate && fetchDayData(selectedDate),
		);
		socketService.on(
			"slotCreated",
			() => selectedDate && fetchDayData(selectedDate),
		);
		return () => {
			socketService.off("slotUpdated");
			socketService.off("slotCreated");
		};
	}, []); // Run once on mount to set today, socket listeners might need re-binding if selectedDate changes?
	// actually socket listener uses selectedDate closure. If selectedDate changes, we need to update listener or better use a ref.
	// The original code had `[selectedDate]` dependency. I should keep that.

	useEffect(() => {
		if (selectedDate) {
			socketService.off("slotUpdated");
			socketService.off("slotCreated");

			// Cập nhật từng slot thay vì fetch lại toàn bộ
			socketService.on("slotUpdated", (updatedSlot) => {
				setSlots(prev => {
					const newSlots = { ...prev };
					Object.keys(newSlots).forEach(dayId => {
						newSlots[dayId] = newSlots[dayId].map(s =>
							s._id === updatedSlot._id ? updatedSlot : s
						);
					});
					return newSlots;
				});
			});

			socketService.on("slotCreated", () => fetchDayData(selectedDate, true));
		}
	}, [selectedDate]);

	const fetchDayData = async (date, silent = false) => {
		if (!date) return;
		if (!silent) setLoading(true);
		try {
			// Fetch all days for this date (across all PTs)
			const { data: dayList } = await api.get(`/ngay-tap?ngay=${date}`);
			setDays(dayList);

			// Fetch slots for each day
			const slotsMap = {};
			await Promise.all(
				dayList.map(async (day) => {
					const res = await api.get(`/gio-tap?ngayTapId=${day._id}`);
					slotsMap[day._id] = res.data;
				}),
			);
			setSlots(slotsMap);
		} catch (err) {
			console.error(err);
		} finally {
			if (!silent) setLoading(false);
		}
	};

	const handleDateChange = (date) => {
		setSelectedDate(date);
		if (date) fetchDayData(date);
		else {
			setDays([]);
			setSlots({});
		}
	};

	// Tắt/bật cả ngày (dùng API mới)
	const toggleDay = async (day) => {
		const originalDays = [...days];
		const newStatus = day.trangThai === "HoatDong" ? "NgungHoatDong" : "HoatDong";
		setDays(prev => prev.map(d => d._id === day._id ? { ...d, trangThai: newStatus } : d));

		try {
			const res = await api.put("/ngay-gio-tap/toggle-day", { ngayTapId: day._id });
			if (res.data.warning) setWarning(res.data.warning);
		} catch (err) {
			setDays(originalDays);
			alert(err.response?.data?.error || "Lỗi cập nhật trạng thái ngày");
		}
	};

	// Mở modal chọn kiểu tắt khung giờ
	const openToggleModal = (slot) => {
		setPendingToggleSlot(slot);
		setToggleScope("local");
		setToggleModal(true);
	};

	const handleToggleConfirm = async () => {
		if (toggleScope === "local") {
			await toggleSlotForDay();
		} else {
			await toggleSlotGlobal();
		}
	};

	// Tắt/bật chỉ cho ngày đang chọn
	const toggleSlotForDay = async () => {
		if (!pendingToggleSlot || !pendingToggleSlot.day) return;
		const slotId = pendingToggleSlot._id;
		const ngayTapId = pendingToggleSlot.day._id;
		setToggleModal(false);
		setLoading(true);

		// Optimistic update
		const originalSlots = { ...slots };
		setSlots(prev => {
			const newSlots = { ...prev };
			Object.keys(newSlots).forEach(dId => {
				newSlots[dId] = newSlots[dId].map(s => {
					if (s._id === slotId) {
						const active = s.trangThai === "HoatDong";
						return { ...s, trangThai: active ? "NgungHoatDong" : "HoatDong", isOverridden: true };
					}
					return s;
				});
			});
			return newSlots;
		});

		try {
			const res = await api.put("/ngay-gio-tap/toggle-slot", { ngayTapId, gioTapId: slotId });
			if (res.data.warning) setWarning(res.data.warning);
			// Sync with real response
			const newStatus = res.data.trangThai;
			setSlots(prev => {
				const newSlots = { ...prev };
				Object.keys(newSlots).forEach(dId => {
					newSlots[dId] = newSlots[dId].map(s =>
						s._id === slotId ? { ...s, trangThai: newStatus, isOverridden: res.data.isOverridden ?? true } : s
					);
				});
				return newSlots;
			});
		} catch (err) {
			setSlots(originalSlots);
			alert(err.response?.data?.error || "Lỗi cập nhật trạng thái");
		} finally {
			setLoading(false);
		}
	};

	// Tắt/bật toàn bộ các ngày (global)
	const toggleSlotGlobal = async () => {
		if (!pendingToggleSlot) return;
		const slotId = pendingToggleSlot._id;
		setToggleModal(false);
		setLoading(true);

		// Optimistic update (ảnh hưởng toàn bộ rows)
		const originalSlots = { ...slots };
		setSlots(prev => {
			const newSlots = { ...prev };
			Object.keys(newSlots).forEach(dId => {
				newSlots[dId] = newSlots[dId].map(s => {
					if (s._id === slotId) {
						const active = s.trangThai === "HoatDong";
						return { ...s, trangThai: active ? "NgungHoatDong" : "HoatDong", isOverridden: false };
					}
					return s;
				});
			});
			return newSlots;
		});

		try {
			const res = await api.put("/ngay-gio-tap/toggle-global", { gioTapId: slotId });
			if (res.data.warning) setWarning(res.data.warning);
		} catch (err) {
			setSlots(originalSlots);
			alert(err.response?.data?.error || "Lỗi cập nhật trạng thái");
		} finally {
			setLoading(false);
		}
	};

	const openAddSlot = (dayId) => {
		setAddForm({
			ngayTapId: dayId,
			gioBatDau: "",
			gioKetThuc: "",
			applyToAll: false,
		});
		setAddModal(true);
	};

	const handleAddSlot = async (e) => {
		e.preventDefault();
		try {
			await api.post("/gio-tap", {
				gioBatDau: addForm.gioBatDau,
				gioKetThuc: addForm.gioKetThuc,
				ngayTapId: addForm.ngayTapId,
				applyToAll: addForm.applyToAll,
			});
			setAddModal(false);
			fetchDayData(selectedDate, true);
			setSuccessMessage(
				addForm.applyToAll ? "Đã thêm cho tất cả các ngày" : "Thêm thành công",
			);
			setShowSuccess(true);
		} catch (err) {
			alert(err.response?.data?.error || "Lỗi thêm khung giờ");
		}
	};

	const openDeleteModal = (slot) => {
		setDeleteSlot(slot);
		setDeleteAll(false);
	};

	const handleDeleteSlot = async () => {
		if (!deleteSlot) return;
		const idToDelete = deleteSlot._id;
		const originalSlots = { ...slots };
		setLoading(true);

		// 1. Optimistic Update
		setSlots(prev => {
			const newSlots = { ...prev };
			Object.keys(newSlots).forEach(dayId => {
				newSlots[dayId] = newSlots[dayId].filter(s => s._id !== idToDelete);
			});
			return newSlots;
		});

		try {
			await api.delete(`/gio-tap/${idToDelete}?deleteAll=${deleteAll}`);
			setDeleteSlot(null);
			if (deleteAll) fetchDayData(selectedDate, true); // Re-fetch if deleting from all days
			setSuccessMessage(
				deleteAll ? "Đã xóa từ tất cả các ngày" : "Xóa thành công",
			);
			setShowSuccess(true);
		} catch (err) {
			// Rollback on error
			setSlots(originalSlots);
			alert(err.response?.data?.error || "Không thể xóa");
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateStr) => {
		if (!dateStr) return "—";
		const d = new Date(dateStr);
		const day = String(d.getDate()).padStart(2, "0");
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	};

	const getWeekday = (dateStr) => {
		if (!dateStr) return "";
		return new Date(dateStr).toLocaleDateString("vi-VN", { weekday: "long" });
	};

	const slotStatusLabels = {
		HoatDong: "Hoạt động",
		Trong: "Hoạt động",
		NgungHoatDong: "Ngưng hoạt động",
		Tat: "Ngưng hoạt động",
	};
	const slotStatusColors = {
		HoatDong: "#16a34a",
		Trong: "#16a34a",
		DaHoanThanh: "#16a34a",
		NgungHoatDong: "#ef4444",
		Tat: "#ef4444",
	};

	const allSlots = days.flatMap((day) =>
		(slots[day._id] || []).map((slot) => ({ ...slot, day })),
	);

	return (
		<div>
			<div className="page-header">
				<div>
					<h1 className="page-title">Quản lý khung giờ tập</h1>
					<p className="page-subtitle">
						Thiết lập và quản lý trạng thái lịch tập
					</p>
				</div>
				{days.length > 0 && (
					<button className="btn btn-primary" onClick={() => openAddSlot(days[0]._id)}>
						<AddIcon /> Thêm mới
					</button>
				)}
			</div>

			{/* Date picker */}
			<div className="card" style={{ marginBottom: 24 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
					<label className="date-label" style={{ fontSize: 16 }}>
						Chọn ngày cần quản lý
					</label>
					<input
						className="input date-input"
						type="date"
						value={selectedDate}
						onChange={(e) => handleDateChange(e.target.value)}
						style={{ width: "auto" }}
					/>
				</div>
			</div>

			{!selectedDate ? (
				<div className="empty-state">
					<div className="empty-icon">📅</div>
					<p>Vui lòng chọn ngày để xem lịch tập</p>
				</div>
			) : loading ? (
				<div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>
					Đang tải...
				</div>
			) : days.length === 0 ? (
				<div className="empty-state">
					<div className="empty-icon">📋</div>
					<p>Chưa có dữ liệu ngày tập cho ngày {formatDate(selectedDate)}</p>
					<button
						className="btn btn-primary"
						style={{ marginTop: 16 }}
						onClick={() => openAddSlot(null)}>
						Tạo ngày mới
					</button>
				</div>
			) : (
				<>
					{/* Section 2: Day Status */}
					{days.map((day) => (
						<div
							key={day._id}
							className="card"
							style={{
								marginBottom: 24,
								padding: "20px",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}>
							<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
								<div
									style={{
										width: 40,
										height: 40,
										borderRadius: "50%",
										background:
											day.trangThai === "HoatDong" ? "#dcfce7" : "#f3f4f6",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: day.trangThai === "HoatDong" ? "#16a34a" : "#9ca3af",
										fontSize: 20,
									}}>
									<img 
										src={onOffIcon} 
										alt="" 
										style={{ 
											width: 20, 
											height: 20, 
											filter: day.trangThai === "HoatDong" 
												? "brightness(0) saturate(100%) invert(32%) sepia(85%) saturate(1636%) hue-rotate(120deg) brightness(97%) contrast(93%)" 
												: "brightness(0) saturate(100%) invert(70%)" 
										}} 
									/>
								</div>
								<div>
									<div style={{ fontWeight: 700, fontSize: 16 }}>
										Trạng thái ngày &nbsp; {formatDate(selectedDate)}
									</div>
									<div
										style={{
											fontSize: 13,
											color:
												day.trangThai === "HoatDong" ? "#16a34a" : "#ef4444",
											fontWeight: 600,
											marginTop: 4,
										}}>
										{day.trangThai === "HoatDong"
											? "Hoạt động"
											: "Ngưng hoạt động"}
									</div>
								</div>
							</div>
							<div className="toggle-wrapper">
								<span
									className={`toggle ${day.trangThai === "HoatDong" ? "active" : ""}`}
									onClick={() => toggleDay(day)}
								/>
							</div>
						</div>
					))}

					{/* Section 3: Slots */}
					<div className="card" style={{ padding: 24 }}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 10,
								marginBottom: 20,
							}}>
							<img src={clockIcon} alt="" style={{ width: 18, height: 18, filter: "brightness(0) saturate(100%) invert(33%) sepia(93%) saturate(1636%) hue-rotate(213deg) brightness(97%) contrast(93%)" }} />
							<span style={{ fontWeight: 600, color: "#374151" }}>
								Danh sách khung giờ tập
							</span>
						</div>
						{allSlots.length === 0 ? (
							<div className="empty-state" style={{ padding: 24, border: "none" }}>
								<p>Chưa có khung giờ nào</p>
							</div>
						) : (
							<div className="slot-grid">
								{allSlots.map((slot) => (
									<div
										key={slot._id}
										className={`slot-card ${slot.day.trangThai !== "HoatDong" ? "slot-disabled" : ""}`}>
										<div className="slot-top">
											<div className="slot-time">
												{slot.gioBatDau} - {slot.gioKetThuc}
											</div>
											<button
												className="delete-btn-simple"
												onClick={() => openDeleteModal(slot)}
												style={slot.day.trangThai !== "HoatDong" ? { opacity: 0.5, pointerEvents: "none" } : {}}>
												<img src={deleteIcon} alt="Delete" />
											</button>
										</div>
										<div className="slot-divider" />
										<div className="slot-bottom">
											<div
												className="status-text"
												style={{
													color: slotStatusColors[slot.trangThai] || "#666",
													fontSize: "13px",
													fontWeight: "600",
												}}>
												{slotStatusLabels[slot.trangThai] || slot.trangThai}
											</div>
											<div className="toggle-wrapper">
												{slot.isOverridden && (
													<span title="Ghi đè riêng cho ngày này" style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, marginRight: 4 }}>
														HÔM NAY
													</span>
												)}
												<span
													className={`toggle ${slot.trangThai === "HoatDong" ? "active" : ""}`}
													onClick={() => openToggleModal(slot)}
													style={slot.day.trangThai !== "HoatDong" ? { opacity: 0.5, pointerEvents: "none" } : {}}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</>
			)}

			{/* Warning Banner */}
			{warning && (
				<div style={{
					background: "#fffbeb",
					border: "1px solid #f59e0b",
					borderRadius: 10,
					padding: "12px 16px",
					marginBottom: 16,
					display: "flex",
					alignItems: "flex-start",
					gap: 10,
					fontSize: 13,
					color: "#92400e",
				}}>
					<span style={{ fontSize: 18 }}>⚠️</span>
					<div style={{ flex: 1 }}>{warning}</div>
					<button
						onClick={() => setWarning(null)}
						style={{ background: "none", border: "none", cursor: "pointer", color: "#92400e", fontSize: 16, padding: 0 }}>
						✕
					</button>
				</div>
			)}

			{/* Modal chọn kiểu toggle khung giờ */}
			<Modal
				isOpen={toggleModal}
				onClose={() => { setToggleModal(false); setPendingToggleSlot(null); }}
				title="Tùy chọn cho hành động này"
				hideClose={true}
				centerTitle={true}>
				<div style={{ padding: "8px 0" }}>
					<div className="form-group">
						<div className="radio-group" style={{ display: "grid", gridTemplateColumns: "1fr"}}>
							<label className={`radio-option-card ${toggleScope === "local" ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
								<input
									type="radio"
									name="toggleScope"
									checked={toggleScope === "local"}
									onChange={() => setToggleScope("local")}
									style={{ margin: 0 }}
								/>
								<span style={{ fontWeight: 600 }}>Sự kiện này</span>
							</label>
							<label className={`radio-option-card ${toggleScope === "global" ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
								<input
									type="radio"
									name="toggleScope"
									checked={toggleScope === "global"}
									onChange={() => setToggleScope("global")}
									style={{ margin: 0 }}
								/>
								<span style={{ fontWeight: 600 }}>Tất cả sự kiện</span>
							</label>
						</div>
					</div>

					<div style={{ display: "flex", gap: 12, marginTop: 24 }}>
						<button
							className="btn btn-outline"
							style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
							onClick={() => setToggleModal(false)}>
							Hủy bỏ
						</button>
						<button
							className="btn btn-primary"
							style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
							onClick={handleToggleConfirm}>
							Xác nhận
						</button>
					</div>
				</div>
			</Modal>

			{/* Add slot modal */}
			<Modal
				isOpen={addModal}
				onClose={() => setAddModal(false)}
				title="Thêm khung giờ tập">
				<form onSubmit={handleAddSlot}>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
						<div className="form-group">
							<label>Giờ bắt đầu</label>
							<input
								className="input"
								type="time"
								value={addForm.gioBatDau}
								onChange={(e) =>
									setAddForm({ ...addForm, gioBatDau: e.target.value })
								}
								required
							/>
						</div>
						<div className="form-group">
							<label>Giờ kết thúc</label>
							<input
								className="input"
								type="time"
								value={addForm.gioKetThuc}
								onChange={(e) =>
									setAddForm({ ...addForm, gioKetThuc: e.target.value })
								}
								required
							/>
						</div>
					</div>
					<div className="form-group">
						<label style={{ marginBottom: 12, display: "block" }}>
							Tuỳ chọn
						</label>
						<div className="radio-group" style={{ display: "flex", gap: 12 }}>
							<label className={`radio-option-card ${!addForm.applyToAll ? "active" : ""}`} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
								<input
									type="radio"
									name="scope"
									checked={!addForm.applyToAll}
									onChange={() => setAddForm({ ...addForm, applyToAll: false })}
									style={{ margin: 0 }}
								/>
								<span>Chỉ ngày hôm nay</span>
							</label>
							<label className={`radio-option-card ${addForm.applyToAll ? "active" : ""}`} style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
								<input
									type="radio"
									name="scope"
									checked={addForm.applyToAll}
									onChange={() => setAddForm({ ...addForm, applyToAll: true })}
									style={{ margin: 0 }}
								/>
								<span>Tất cả các ngày</span>
							</label>
						</div>
					</div>
					<div
						style={{
							display: "flex",
							gap: 12,
							marginTop: 24,
						}}>
						<button
							type="button"
							className="btn btn-outline"
							style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
							onClick={() => setAddModal(false)}>
							Hủy bỏ
						</button>
						<button type="submit" className="btn btn-primary" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
							Lưu khung giờ
						</button>
					</div>
				</form>
			</Modal>

			<Modal
				isOpen={!!deleteSlot}
				onClose={() => setDeleteSlot(null)}
				title="Xóa khung giờ?">
				<div style={{ padding: "0 4px" }}>
					<p style={{ fontSize: 15, color: "#4B5563", marginBottom: 16 }}>
						Bạn có chắc chắn muốn xóa khung giờ:{" "}
						<strong style={{ color: "#ef4444" }}>
							{deleteSlot?.gioBatDau} - {deleteSlot?.gioKetThuc}
						</strong>
						?
					</p>

					<div className="form-group">
						<label
							style={{
								marginBottom: 12,
								display: "block",
								fontSize: 14,
								fontWeight: 600,
								color: "#374151",
							}}>
							Tuỳ chọn xóa
						</label>
						<div
							className="radio-group"
							style={{
								display: "grid",
								gridTemplateColumns: "1fr",
								gap: 10,
							}}>
							<label
								className={`radio-option-card ${!deleteAll ? "active" : ""}`}
								style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
								<input
									type="radio"
									name="deleteScope"
									checked={!deleteAll}
									onChange={() => setDeleteAll(false)}
									style={{ margin: 0 }}
								/>
								<span>Chỉ ngày này</span>
							</label>
							<label
								className={`radio-option-card ${deleteAll ? "active" : ""}`}
								style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
								<input
									type="radio"
									name="deleteScope"
									checked={deleteAll}
									onChange={() => setDeleteAll(true)}
									style={{ margin: 0 }}
								/>
								<span>Tất cả ngày</span>
							</label>
						</div>
					</div>

					<div
						style={{
							display: "flex",
							gap: 12,
							marginTop: 24,
						}}>
						<button
							className="btn btn-outline"
							style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
							onClick={() => setDeleteSlot(null)}>
							Hủy bỏ
						</button>
						<button
							className="btn btn-danger"
							style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
							onClick={handleDeleteSlot}>
							Xác nhận xoá
						</button>
					</div>
				</div>
			</Modal>

			<SuccessModal
				isOpen={showSuccess}
				onClose={() => setShowSuccess(false)}
				message={successMessage}
			/>
			<style>{`
        .date-picker-section { display: none; } /* Legacy class cleanup if needed, but I replaced usage with .card */
        /* Card & Layout */
        .card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          color: #6B7280;
        }
        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        /* Toggle */
        .toggle-wrapper {
          display: flex;
          align-items: center;
        }
        .toggle {
          position: relative;
          width: 44px;
          height: 24px;
          background: #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .toggle.active { background: #3b82f6; }
        .toggle::after {
          content: "";
          position: absolute;
          top: 2px; left: 2px;
          width: 20px; height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
        }
        .toggle.active::after { transform: translateX(20px); }

        /* Slot Grid */
        .slot-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .slot-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.2s;
        }
        .slot-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .slot-disabled {
          opacity: 0.7;
          background: #f9fafb;
        }
        .slot-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .slot-time {
          font-weight: 700;
          font-size: 16px;
          color: #1f2937;
        }
        .delete-btn-simple {
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.4;
          transition: opacity 0.2s;
          padding: 4px;
        }
        .delete-btn-simple:hover { opacity: 1; }
        .delete-btn-simple img { width: 18px; height: 18px; }

        .slot-divider {
          height: 1px;
          background: #f3f4f6;
          margin-bottom: 12px;
        }

        .slot-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Form & Modal */
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; }
        .radio-option-card {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 8px 0;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }
        .radio-option-card input {
          margin-right: 12px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        .radio-content span {
          font-size: 15px;
          font-weight: 500;
          color: #374151;
          transition: all 0.2s;
        }
        .radio-option-card.active .radio-content span {
          color: #2563eb;
          font-weight: 600;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .modal-footer .btn {
          flex: 1;
          justify-content: center;
          padding: 12px;
          font-weight: 600;
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
