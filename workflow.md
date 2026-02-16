# SYSTEM WORKFLOWS - PRIVATE FITNESS BOOKING SYSTEM

## WORKFLOW 1: Authentication & Authorization

### 1.1 Luồng Đăng Nhập (Login Flow)

**Actors:** Hội viên, PT, Quản trị viên

**Steps:**

1. **Frontend:** User nhập thông tin đăng nhập
   - Quản trị viên: `username` + `password`
   - PT/Hội viên: `phone` + `password`

2. **Backend:** Xác thực thông tin
   - Kiểm tra collection `QuanTriVien` (nếu username)
   - Kiểm tra collection `Users` (nếu phone)
   - So sánh `passwordHash` với bcrypt

3. **Backend:** Tạo JWT Token

   ```javascript
   {
     userId: user._id,
     role: "ADMIN" | "PT" | "HOIVIEN",
     exp: timestamp
   }
   ```

4. **Backend:** Trả về `accessToken`

5. **Frontend:** Lưu token (HTTPOnly cookie hoặc localStorage/memory)

### 1.2 Middleware Authentication

**Mỗi request bảo mật:**

1. **Frontend:** Gửi token trong header: `Authorization: Bearer <token>`

2. **Backend Middleware:** `verifyToken()`
   - Kiểm tra token hợp lệ
   - Decode payload
   - Gắn `req.user = { userId, role }`

3. **Backend Middleware:** `authorizeRole(requiredRole)`
   - Kiểm tra `req.user.role` có khớp với `requiredRole`
   - Nếu không → Trả 403 Forbidden
   - Nếu có → Cho phép truy cập

---

## WORKFLOW 2: Đặt Lịch Tập (Booking)

### 2.1 Hiển Thị Slot Khả Dụng

**Actor:** Hội viên

**Steps:**

1. **Frontend:** Hội viên mở trang đặt lịch

2. **Backend:** Lấy thông tin khóa tập hiện tại

   ```javascript
   // Logic xác định khóa tập hiện tại
   const enrollments = await DangKyKhoaTap.find({ hoiVienId })
     .sort({ ngayDangKy: 1 }); // Sắp xếp theo ngày đăng ký tăng dần

   const activeEnrollment = enrollments.find(e => e.soBuoiConLai > 0);

   if (!activeEnrollment) {
     return { message: "Không còn buổi tập" };
   }

   const ptId = activeEnrollment.ptId;
   ```

3. **Backend:** Lọc slot khả dụng
   - Lấy tất cả `NgayTap` và `GioTap` có `trangThai = "ACTIVE"`
   - Loại bỏ các slot trong quá khứ
   - Loại bỏ các slot đã được đặt (có `LichTap` với `trangThai = "BOOKED"`)
   - Chỉ hiển thị slot của PT thuộc khóa tập hiện tại (`ptId`)

4. **Frontend:** Hiển thị danh sách slot trống

### 2.2 Thực Hiện Đặt Lịch

**Steps:**

1. **Frontend:** Hội viên chọn slot (ngày + giờ)

2. **Frontend:** Gửi request đặt lịch

   ```javascript
   POST /api/lich-tap
   {
     ngayTapId,
     gioTapId
   }
   ```

3. **Backend:** Kiểm tra điều kiện
   - ✅ Slot còn trống (chưa có `LichTap` nào `BOOKED`)
   - ✅ `soBuoiConLai > 0` của khóa tập hiện tại
   - ✅ Slot không trong quá khứ
   - ✅ PT của slot khớp với PT của khóa tập hiện tại

4. **Backend:** Tạo bản ghi `LichTap`

   ```javascript
   {
     ngayTapId,
     gioTapId,
     dangKyKhoaTapId: activeEnrollment._id,
     trangThai: "BOOKED",
     createdAt: now
   }
   ```

5. **Backend:** Emit Socket.io event

   ```javascript
   io.emit('slotUpdated', {
     ngayTapId,
     gioTapId,
     status: 'booked'
   });
   ```

6. **Frontend (All Clients):** Cập nhật UI ngay lập tức
   - Slot biến mất khỏi danh sách trống
   - UI của PT cập nhật lịch dạy
   - UI của Admin cập nhật dashboard

---

## WORKFLOW 3: Hủy Lịch Tập (Cancellation)

### 3.1 Hủy Hợp Lệ (Trước 2 Tiếng)

**Actor:** Hội viên

**Steps:**

1. **Frontend:** Hội viên nhấn nút "Hủy lịch" trên buổi tập đã đặt

2. **Frontend:** Gửi request

   ```javascript
   PATCH /api/lich-tap/:id/cancel
   ```

3. **Backend:** Kiểm tra điều kiện

   ```javascript
   const lichTap = await LichTap.findById(id)
     .populate('ngayTapId')
     .populate('gioTapId');

   const ngayTap = lichTap.ngayTapId.thoiGianTap;
   const gioTap = lichTap.gioTapId.gioBatDau;

   const sessionTime = new Date(`${ngayTap} ${gioTap}`);
   const now = new Date();
   const hoursDiff = (sessionTime - now) / (1000 * 60 * 60);

   if (hoursDiff < 2) {
     return res.status(400).json({
       error: "Không thể hủy trong vòng 2 tiếng trước giờ tập"
     });
   }
   ```

4. **Backend:** Cập nhật trạng thái

   ```javascript
   lichTap.trangThai = "CANCELLED";
   await lichTap.save();
   ```

5. **Backend:** Emit socket event

   ```javascript
   io.emit('slotUpdated', {
     ngayTapId,
     gioTapId,
     status: 'available'
   });
   ```

6. **Frontend:** Slot trở lại danh sách trống cho người khác đặt

### 3.2 Hủy Trong Vòng 2 Tiếng (Trường Hợp Đặc Biệt)

**Rule:** Nếu hội viên hủy trong vòng 2 tiếng, PT vẫn có quyền đánh dấu "Hoàn thành" và trừ buổi tập

**Backend Logic:**

```javascript
// Khi PT xác nhận hoàn thành
if (lichTap.trangThai === "CANCELLED") {
  // Kiểm tra xem có hủy trong vòng 2 tiếng không
  const cancelTime = lichTap.updatedAt;
  const sessionTime = new Date(`${ngayTap} ${gioTap}`);
  const hoursDiff = (sessionTime - cancelTime) / (1000 * 60 * 60);

  if (hoursDiff < 2) {
    // Cho phép PT xác nhận và trừ buổi
    lichTap.trangThai = "COMPLETED";
    await deductSession(dangKyKhoaTapId);
  }
}
```

---

## WORKFLOW 4: PT Hoàn Thành Buổi Tập (Session Completion)

**Actor:** PT

**Steps:**

1. **Frontend:** PT mở danh sách buổi tập của mình

2. **Backend:** Lấy danh sách `LichTap`

   ```javascript
   const sessions = await LichTap.find({
     dangKyKhoaTapId: {
       $in: await DangKyKhoaTap.find({ ptId: req.user.userId })
     },
     trangThai: "BOOKED"
   });
   ```

3. **Frontend:** PT chọn buổi tập và nhấn "Hoàn thành"

4. **Backend:** Kiểm tra điều kiện

   ```javascript
   const sessionTime = new Date(`${ngayTap} ${gioTap} ${gioKetThuc}`);
   const now = new Date();

   if (now < sessionTime) {
     return res.status(400).json({
       error: "Buổi tập chưa diễn ra"
     });
   }
   ```

5. **Backend:** Sử dụng MongoDB Transaction

   ```javascript
   const session = await mongoose.startSession();
   session.startTransaction();

   try {
     // Bước 1: Cập nhật trạng thái LichTap
     await LichTap.findByIdAndUpdate(
       lichTapId,
       { trangThai: "COMPLETED" },
       { session }
     );

     // Bước 2: Trừ buổi tập (logic phức tạp)
     const enrollment = await DangKyKhoaTap.findById(dangKyKhoaTapId).session(session);

     // Lấy khóa tập cũ nhất còn buổi
     const enrollments = await DangKyKhoaTap.find({
       hoiVienId: enrollment.hoiVienId
     })
       .sort({ ngayDangKy: 1 })
       .session(session);

     const activeEnrollment = enrollments.find(e => e.soBuoiConLai > 0);

     if (activeEnrollment) {
       activeEnrollment.soBuoiConLai -= 1;
       await activeEnrollment.save({ session });
     }

     await session.commitTransaction();

     // Bước 3: Emit socket SAU KHI transaction thành công
     io.emit('sessionCompleted', {
       hoiVienId: enrollment.hoiVienId,
       soBuoiConLai: activeEnrollment.soBuoiConLai
     });

   } catch (error) {
     await session.abortTransaction();
     throw error;
   } finally {
     session.endSession();
   }
   ```

6. **Frontend (Hội viên):** UI cập nhật số buổi còn lại ngay lập tức

**⚠️ Business Rule:**

- Sau khi đánh dấu `COMPLETED` → **KHÔNG ROLLBACK**
- Luôn trừ vào khóa tập **cũ nhất còn buổi** (theo `ngayDangKy`)

---

## WORKFLOW 5: Admin Quản Lý Slot

### 5.1 Tạo Slot Mới

**Actor:** Quản trị viên

**Steps:**

1. **Frontend:** Admin chọn thêm slot mới
   - Chọn ngày tập
   - Nhập giờ bắt đầu
   - Nhập giờ kết thúc

2. **Backend:** Kiểm tra điều kiện

   ```javascript
   // Kiểm tra không trùng lặp
   const exists = await GioTap.findOne({
     gioBatDau: reqBody.gioBatDau,
     gioKetThuc: reqBody.gioKetThuc
   });

   if (exists) {
     return res.status(400).json({ error: "Slot đã tồn tại" });
   }

   // Kiểm tra không trong quá khứ
   const slotTime = new Date(`${reqBody.ngayTap} ${reqBody.gioBatDau}`);
   if (slotTime < new Date()) {
     return res.status(400).json({ error: "Không thể tạo slot trong quá khứ" });
   }
   ```

3. **Backend:** Tạo bản ghi

   ```javascript
   const gioTap = await GioTap.create({
     gioBatDau,
     gioKetThuc,
     trangThai: "ACTIVE"
   });

   const ngayTap = await NgayTap.create({
     thoiGianTap: ngayTap,
     trangThai: "ACTIVE"
   });
   ```

4. **Backend:** Emit socket event

   ```javascript
   io.emit('slotCreated', { ngayTapId, gioTapId });
   ```

5. **Frontend:** UI tất cả người dùng cập nhật danh sách slot

### 5.2 Xóa Slot

**Business Rule:** Không xóa slot đã có người đặt

**Steps:**

1. **Backend:** Kiểm tra trước khi xóa

   ```javascript
   const hasBooking = await LichTap.findOne({
     ngayTapId,
     gioTapId,
     trangThai: { $in: ["BOOKED", "COMPLETED"] }
   });

   if (hasBooking) {
     return res.status(400).json({
       error: "Không thể xóa slot đã có người đặt"
     });
   }

   await NgayTap.findByIdAndUpdate(ngayTapId, { trangThai: "INACTIVE" });
   await GioTap.findByIdAndUpdate(gioTapId, { trangThai: "INACTIVE" });
   ```

### 5.3 Tạo Đăng Ký Khóa Tập

**Actor:** Quản trị viên

**Steps:**

1. **Frontend:** Admin chọn:
   - Hội viên (`hoiVienId`)
   - PT (`ptId`)
   - Khóa tập (`khoaTapId`)

2. **Backend:** Lấy thông tin khóa tập

   ```javascript
   const khoaTap = await KhoaTap.findById(khoaTapId);
   const soBuoi = khoaTap.soBuoi;
   ```

3. **Backend:** Tạo đăng ký

   ```javascript
   await DangKyKhoaTap.create({
     hoiVienId,
     ptId,
     khoaTapId,
     soBuoiConLai: soBuoi,
     ngayDangKy: new Date()
   });
   ```

4. **Frontend:** Cập nhật danh sách đăng ký

---

## WORKFLOW 6: Phân Quyền & Quản Lý Tài Khoản

### 6.1 Tạo Tài Khoản Mới

**Actor:** Quản trị viên

**Steps:**

1. **Frontend:** Admin nhập thông tin:
   - `phone`
   - `password`
   - `vaiTro`: "PT" hoặc "HOIVIEN"
   - `hoTen`, `ngaySinh`, `gioiTinh`

2. **Backend:** Hash password

   ```javascript
   const bcrypt = require('bcrypt');
   const passwordHash = await bcrypt.hash(password, 10);
   ```

3. **Backend:** Tạo user

   ```javascript
   await Users.create({
     phone,
     passwordHash,
     vaiTro,
     hoTen,
     ngaySinh,
     gioiTinh,
     trangThai: "ACTIVE"
   });
   ```

### 6.2 Thay Đổi Vai Trò

**Steps:**

1. **Backend:** Cập nhật vai trò

   ```javascript
   await Users.findByIdAndUpdate(userId, { vaiTro: newRole });
   ```

2. **Rule:** Khi user login lại, JWT mới sẽ chứa `role` mới

---

## WORKFLOW 7: Real-time Synchronization

### 7.1 Socket.io Events

**Server Setup:**

```javascript
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User tự động join room theo role
  socket.on('join', (data) => {
    socket.join(`role:${data.role}`);
    socket.join(`user:${data.userId}`);
  });
});
```

**Events:**

| Event Name | Khi Nào | Payload | Clients Nhận |
|------------|---------|---------|--------------|
| `slotUpdated` | Khi đặt/hủy lịch | `{ ngayTapId, gioTapId, status }` | Tất cả users |
| `sessionCompleted` | PT hoàn thành buổi tập | `{ hoiVienId, soBuoiConLai }` | Hội viên cụ thể |
| `slotCreated` | Admin tạo slot mới | `{ ngayTapId, gioTapId }` | Tất cả users |
| `slotStatusChanged` | Admin đổi trạng thái slot | `{ ngayTapId, gioTapId, trangThai }` | Tất cả users |

### 7.2 Frontend Xử Lý Real-time

**React Example:**

```javascript
useEffect(() => {
  const socket = io(SERVER_URL);

  socket.emit('join', { role: user.role, userId: user.id });

  socket.on('slotUpdated', (data) => {
    // Cập nhật state để re-render danh sách slot
    setSlots(prev => prev.filter(s =>
      s.ngayTapId !== data.ngayTapId || s.gioTapId !== data.gioTapId
    ));
  });

  socket.on('sessionCompleted', (data) => {
    if (data.hoiVienId === user.id) {
      setSessionsRemaining(data.soBuoiConLai);
    }
  });

  return () => socket.disconnect();
}, []);
```

---

## WORKFLOW 8: Xử Lý Nhiều Khóa Tập

### 8.1 Logic Ưu Tiên Khóa Tập

**Nguyên tắc:** Hệ thống luôn ưu tiên khóa tập **cũ nhất còn buổi**

**Implementation:**

```javascript
async function getActiveEnrollment(hoiVienId) {
  const enrollments = await DangKyKhoaTap.find({ hoiVienId })
    .sort({ ngayDangKy: 1 }); // Tăng dần = cũ nhất trước

  const active = enrollments.find(e => e.soBuoiConLai > 0);

  return active;
}
```

### 8.2 Hiển Thị Đúng PT

**Khi hội viên vào trang đặt lịch:**

```javascript
// Backend API
GET /api/available-slots

const activeEnrollment = await getActiveEnrollment(req.user.userId);

if (!activeEnrollment) {
  return res.json({ slots: [], message: "Không còn buổi tập" });
}

const ptId = activeEnrollment.ptId;

// Chỉ lấy slot của PT này
const slots = await getAvailableSlots({ ptId });
```

### 8.3 Ngăn Chặn Đặt Nhầm PT

**Frontend Validation:**

```javascript
// Trước khi submit đặt lịch
if (selectedSlot.ptId !== currentEnrollment.ptId) {
  alert("Slot này không thuộc PT của khóa tập hiện tại");
  return;
}
```

---

## BUSINESS RULES SUMMARY

### Critical Rules (KHÔNG ĐƯỢC VI PHẠM)

1. ✅ Không đặt lịch trong quá khứ
2. ✅ Mỗi slot chỉ 1 hội viên / 1 PT
3. ✅ Không hủy lịch trong vòng **2 tiếng** trước giờ tập
4. ✅ Không xóa slot đã có người đặt
5. ✅ Sau khi `COMPLETED` → KHÔNG rollback
6. ✅ Khi PT hoàn thành → trừ vào khóa tập **cũ nhất còn buổi**
7. ✅ Nếu `soBuoiConLai = 0` → Không cho đặt thêm
8. ✅ Hội viên chỉ thấy slot của PT thuộc khóa hiện tại
9. ✅ Dùng **MongoDB Transaction** khi trừ buổi
10. ✅ Emit socket **SAU KHI** transaction thành công

---

## PERFORMANCE & SECURITY CONSIDERATIONS

### Database Indexes

```javascript
// MongoDB Indexes
Users.index({ phone: 1 });
LichTap.index({ ngayTapId: 1, gioTapId: 1 });
DangKyKhoaTap.index({ hoiVienId: 1, ngayDangKy: 1 });
```

### Security Best Practices

- Hash password với bcrypt (salt rounds ≥ 10)
- JWT expiration: 24h cho accessToken
- Không bao giờ trả `passwordHash` trong response
- Validate input ở cả frontend và backend
- Rate limiting cho login endpoint

### Real-time Performance

- Socket.io event phải emit < 2s
- API response time < 2s
- Sử dụng room để giảm broadcast không cần thiết