# 🏥 ONUS Fitness — Báo Cáo Kiểm Tra Toàn Bộ Project

## Tóm tắt

| Loại | Số lượng |
|------|----------|
| 🔴 **Lỗi nghiêm trọng (Bug)** | 5 |
| 🟡 **Vấn đề cần cải thiện** | 6 |
| 🗑️ **File/Folder không dùng tới** | 6 |

---

## 🔴 LỖI NGHIÊM TRỌNG (BUG)

### Bug 1: [SessionStatusPage.jsx](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/SessionStatusPage.jsx) — Gọi `navigate()` trực tiếp trong render body
**File:** [SessionStatusPage.jsx](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/SessionStatusPage.jsx)

```jsx
// ❌ BUG: navigate() được gọi trực tiếp trong function body, KHÔNG nằm trong useEffect
function SessionStatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  navigate(`/pt/session/${id}`, { replace: true }); // ← Gây infinite re-render!
  return null;
}
```

> [!CAUTION]
> Gọi `navigate()` ngoài `useEffect` vi phạm React rules — gây **infinite re-render loop** hoặc console warning. Phải wrap trong `useEffect` hoặc dùng `<Navigate>` component.

---

### Bug 2: PT ProfilePage — Dùng `user?.role` (không tồn tại) thay vì `user?.vaiTro`
**File:** [pt/ProfilePage.jsx#L28](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/ProfilePage.jsx#L28)

```jsx
// ❌ user.role không tồn tại trong AuthContext — luôn hiển thị undefined
<span className="badge">{user?.role}</span>

// ✅ Đúng phải là:
<span className="badge">{user?.vaiTro === 'PT' ? 'Huấn luyện viên' : user?.vaiTro}</span>
```

> [!CAUTION]
> AuthContext chỉ có `{ id, hoTen, vaiTro, taiKhoan }`. Không có field [role](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/middleware/role.js#1-14). PT sẽ thấy badge trống.

---

### Bug 3: Frontend truy cập `booking.ptId` và `booking.hoiVienId` — Nhưng backend API KHÔNG trả về trực tiếp
**Files:**
- [member/DashboardPage.jsx#L121](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/member/DashboardPage.jsx#L121): `booking.ptId?.hoTen`
- [member/SchedulePage.jsx#L103](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/member/SchedulePage.jsx#L103): `booking.ptId?.hoTen`
- [pt/SchedulePage.jsx#L108](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/SchedulePage.jsx#L108): `booking.hoiVienId?.hoTen`
- [pt/SessionDetailPage.jsx#L45-46](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/SessionDetailPage.jsx#L45-L46): `booking.hoiVienId?.hoTen`, `booking.hoiVienId?.soDienThoai`

Sau refactor schema, [LichTap](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/admin/LichTapPage.jsx#8-477) model **KHÔNG CÓ** field `hoiVienId` hay `ptId` trực tiếp. Dữ liệu này nằm bên trong `dangKyKhoaTapId` (populated nested).

```
// Backend trả về: booking.dangKyKhoaTapId.ptId.hoTen
// Frontend đang dùng: booking.ptId?.hoTen ← UNDEFINED!
```

> [!CAUTION]
> Đường dẫn đúng phải là `booking.dangKyKhoaTapId?.ptId?.hoTen` và `booking.dangKyKhoaTapId?.hoiVienId?.hoTen`. Hiện tại tất cả đều hiển thị **"—"** (fallback).

---

### Bug 4: BookingPage — Truy cập `selectedDay.ptId` nhưng `NgayTap` model KHÔNG CÓ field `ptId`
**File:** [member/BookingPage.jsx#L67](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/member/BookingPage.jsx#L67)

```jsx
// ❌ NgayTap schema chỉ có: { ngay, trangThai } — KHÔNG CÓ ptId
ptId: selectedDay.ptId?._id || selectedDay.ptId
```

Sau migration đã `$unset: { ptId: "" }` khỏi NgayTap. Frontend gửi `ptId: undefined` khi booking → `bookingService.bookSession` tìm enrollment **bằng ptId = undefined** → có thể fail!

> [!CAUTION]
> Logic booking cần được cập nhật. Nếu `ptId` không còn trong `NgayTap`, cần cách khác để xác định PT khi đặt lịch.

---

### Bug 5: `VITE_API_URL` được đặt trong [backend/.env](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/.env) thay vì `frontend/.env`
**File:** [backend/.env#L5](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/.env#L5)

```
# Trong backend/.env:
VITE_API_URL = https://schedule-onus.onrender.com/api  ← SAI VỊ TRÍ!
```

Vite chỉ đọc [.env](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/.env) từ **frontend root** (`frontend/.env`). Biến này ở [backend/.env](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/.env) sẽ **KHÔNG BAO GIỜ** được Vite load. Khi build frontend trên Vercel, nó dùng env var của Vercel, nên production vẫn hoạt động. Nhưng cấu trúc file [.env](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/.env) gây nhầm lẫn.

---

## 🟡 VẤN ĐỀ CẦN CẢI THIỆN

### 1. Vẫn dùng `confirm()` / `alert()` native ở 3 nơi
Đã có [ConfirmModal](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/ConfirmModal.jsx#1-102) component nhưng KHÔNG dùng ở:
- [BookingPage.jsx#L59](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/member/BookingPage.jsx#L59): `confirm(...)` khi đặt lịch
- [SchedulePage.jsx#L35](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/member/SchedulePage.jsx#L35): `confirm(...)` khi hủy lịch
- [SessionDetailPage.jsx#L28](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/SessionDetailPage.jsx#L28): `confirm(...)` khi hoàn thành

> [!NOTE]
> Giao diện không nhất quán. Các trang admin dùng [ConfirmModal](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/ConfirmModal.jsx#1-102) rất đẹp, nhưng member/PT pages thì dùng hộp thoại trình duyệt xấu.

---

### 2. CORS mở hoàn toàn — Bảo mật yếu
**File:** [server.js#L26](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/server.js#L26)

```js
return callback(null, true); // Allow all for now ← NGUY HIỂM
```

Dù có logic check `allowedOrigins`, nhưng luôn return `true` ở cuối → cho phép MỌI domain.

---

### 3. PT ProfilePage quá đơn giản so với Member ProfilePage
**File:** [pt/ProfilePage.jsx](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/ProfilePage.jsx)

PT ProfilePage chỉ hiển thị tên và SĐT từ JWT (không gọi API). Không có giới tính, ngày sinh, trạng thái. Trong khi Member ProfilePage gọi API `/users/:id` và hiển thị đầy đủ + enrollment info.

---

### 4. Socket listener closure stale trong BookingPage
**File:** [BookingPage.jsx#L14-23](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/member/BookingPage.jsx#L14-L23)

```jsx
useEffect(() => {
  // ...
  socketService.on('slotUpdated', () => selectedDay && fetchSlots(selectedDay));
  // ← selectedDay là null lúc mount, closure giữ giá trị cũ mãi!
}, []); // dependency rỗng
```

Khi `selectedDay` thay đổi, listener vẫn giữ reference cũ (null) → socket events sẽ KHÔNG refresh data. LichTapPage admin fix được vấn đề này bằng `useEffect` thứ 2 re-bind listener, nhưng BookingPage thì KHÔNG.

---

### 5. `DangKyKhoaTap` trong [DangKyKhoaPage](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/admin/DangKyKhoaPage.jsx#8-169) — Duplicate column key
**File:** [DangKyKhoaPage.jsx#L88-90](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/admin/DangKyKhoaPage.jsx#L88-L90)

```jsx
// Hai column dùng cùng key 'khoaTapId':
{ key: 'khoaTapId', label: 'Khóa tập', render: (v) => v?.tenKhoaTap || '—' },
{ key: 'khoaTapId', label: 'Tổng buổi', render: (v) => v?.soBuoi || '—' },
```

React key trùng nhau có thể gây warning hoặc render sai.

---

### 6. [completeSession](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/services/bookingService.js#122-175) cho phép complete cả booking `DaHuy`
**File:** [bookingService.js#L143](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/services/bookingService.js#L143)

```js
if (!booking || booking.trangThai === 'DaHoanThanh') {
  // Chỉ check DaHoanThanh → booking DaHuy vẫn có thể complete!
}
```

Nên check: `booking.trangThai !== 'DaDat'`

---

## 🗑️ FILE / FOLDER KHÔNG DÙNG TỚI

### 1. [index.js](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/index.js) (Root) — File demo cũ, KHÔNG liên quan project
**File:** [index.js](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/index.js)

File demo MongoDB thuần (`MongoClient`) với `registerUser/loginUser` — hoàn toàn không liên quan đến project ONUS. Dùng `import` syntax (ESM) trong khi project chính dùng `require` (CJS). Nên **XÓA**.

---

### 2. [package.json](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/package.json) + [package-lock.json](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/package-lock.json) + `node_modules/` (Root)
**File:** [package.json](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/package.json)

Package.json root có `mongodb` + `bcrypt` dependencies cho file [index.js](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/index.js) demo cũ. Project thật dùng [backend/package.json](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/package.json) riêng. Root `node_modules/` nên **XÓA**.

---

### 3. `everything-claude-code/` — Thư viện Claude Code config, KHÔNG phải code project
**Folder:** `everything-claude-code/`

Chứa 30+ files (README, LICENSE, configs, schemas...) — Là một repo hướng dẫn cấu hình Claude Code agent. Không liên quan project ONUS. Nên **XÓA** hoặc move ra ngoài.

---

### 4. [frontend/src/icon/user.png](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/icon/user.png) — Icon không được import ở bất kỳ đâu
**File:** [frontend/src/icon/user.png](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/icon/user.png) (11.9KB)

Tìm kiếm [user.png](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/icon/user.png) trong toàn bộ `src/` trả về 0 kết quả. Tất cả avatar đều dùng [nam.png](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/icon/nam.png), [nu.png](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/icon/nu.png), [quantrivien.png](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/icon/quantrivien.png).

---

### 5. [SessionStatusPage.jsx](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/SessionStatusPage.jsx) — Page redirect, nên dùng route redirect thay thế  
**File:** [SessionStatusPage.jsx](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/SessionStatusPage.jsx)

Chỉ chứa redirect → [SessionDetailPage](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/pt/SessionDetailPage.jsx#5-112). Ngoài Bug #1 (navigate ngoài useEffect), page này thừa. Có thể xóa file + thay bằng `<Navigate>` trực tiếp trong route config.

---

### 6. `.hivemind/` + `.opencode/` + `.agent/` — Metadata của AI tools khác
Các folder cấu hình từ các AI coding tool khác. Không ảnh hưởng runtime nhưng làm project directory bị rối.

---

## 📊 Tổng Kết Ưu Tiên

| Ưu tiên | Hành động |
|---------|-----------|
| 🔴 **P0** | Fix Bug #3 (booking.ptId → dangKyKhoaTapId.ptId) — Hiện tại Member/PT thấy "—" thay vì tên PT/HV |
| 🔴 **P0** | Fix Bug #4 (BookingPage gửi ptId undefined khi booking) — Có thể khiến booking thất bại |
| 🔴 **P1** | Fix Bug #1 (SessionStatusPage navigate loop) |
| 🔴 **P1** | Fix Bug #2 (PT ProfilePage user?.role → user?.vaiTro) |
| 🟡 **P2** | Fix Bug #5 (move VITE_API_URL sang frontend/.env) |
| 🟡 **P2** | Fix completeSession cho phép complete booking DaHuy |
| 🟡 **P3** | Thay confirm()/alert() bằng ConfirmModal/SuccessModal |
| 🟡 **P3** | Fix socket closure stale trong BookingPage |
| 🗑️ **Clean** | Xóa index.js, root package.json/node_modules, everything-claude-code, user.png, SessionStatusPage |
