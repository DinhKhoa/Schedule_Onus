# 🏋️ ONUS Fitness Booking System — Complete Knowledge Base

## 1. Project Overview

| Item               | Detail                                                        |
| ------------------ | ------------------------------------------------------------- |
| **Name**     | Private Fitness Booking System (ONUS GYM)                     |
| **Purpose**  | Online gym booking system connecting Members ↔ PTs ↔ Admins |
| **Backend**  | Node.js + Express + MongoDB (Mongoose) + JWT + Socket.io      |
| **Frontend** | React 19 (Vite) + Axios + React Router v7 + Socket.io Client  |
| **Database** | MongoDB Atlas (`scheduleingym`)                             |
| **Deploy**   | Backend: Render.com / Frontend: Vercel                        |

---

## 2. Database Schema (7 Models)

### 2.1 [User](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/UserInfo.jsx#8-81) (Collection: [Users](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/admin/TaiKhoanPage.jsx#25-32))

```
hoTen (String, 2-50 chars), soDienThoai (String, unique, 10 digits),
matKhau (String, hashed), gioiTinh (Nam|Nữ), ngaySinh (Date, ≥18 tuổi),
vaiTro (HOIVIEN|PT), trangThai (HoatDong|NgungHoatDong)
Indexes: soDienThoai, vaiTro
```

### 2.2 `QuanTriVien` (Collection: `QuanTriVien`)

```
taiKhoan (String, unique), matKhau (String, hashed), hoTen (String)
```

### 2.3 [KhoaTap](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/admin/KhoaTapPage.jsx#10-216) (Collection: [KhoaTap](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/admin/KhoaTapPage.jsx#10-216))

```
tenKhoaTap (String, unique, required), soBuoi (Number, 1-40)
```

### 2.4 `DangKyKhoaTap` (Collection: `DangKyKhoaTap`)

```
hoiVienId (→ User), khoaTapId (→ KhoaTap), ptId (→ User),
ngayDangKy (Date), soBuoiConLai (Number, min: 0)
Indexes: hoiVienId, ptId
```

### 2.5 `NgayTap` (Collection: `NgayTap`)

```
ngay (Date, unique), trangThai (HoatDong|Tat)
Index: ngay (unique)
```

### 2.6 `GioTap` (Collection: `GioTap`)

```
gioBatDau (String), gioKetThuc (String), trangThai (Trong|Tat)
```

### 2.7 [LichTap](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/admin/LichTapPage.jsx#8-477) (Collection: [LichTap](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/pages/admin/LichTapPage.jsx#8-477))

```
gioTapId (→ GioTap), ngayTapId (→ NgayTap), dangKyKhoaTapId (→ DangKyKhoaTap),
trangThai (DaDat|DaHoanThanh|DaHuy)
Indexes: dangKyKhoaTapId, (gioTapId + ngayTapId unique)
```

---

## 3. API Routes

| Base Path                     | Auth | Role                           | Methods                                                        |
| ----------------------------- | ---- | ------------------------------ | -------------------------------------------------------------- |
| `/api/auth/login`           | ❌   | All                            | POST                                                           |
| `/api/auth/change-password` | ✅   | All                            | POST                                                           |
| `/api/users`                | ✅   | ADMIN                          | GET, POST, PUT, DELETE                                         |
| `/api/users/:id`            | ✅   | Any (GET), ADMIN (PUT, DELETE) | GET, PUT, DELETE                                               |
| `/api/khoa-tap`             | ✅   | Any(GET), ADMIN(CUD)           | GET, POST, PUT, DELETE                                         |
| `/api/dang-ky-khoa-tap`     | ✅   | ADMIN                          | GET, POST, DELETE                                              |
| `/api/ngay-tap`             | ✅   | Any(GET), ADMIN(CU)            | GET, POST, PUT                                                 |
| `/api/gio-tap`              | ✅   | Any(GET), ADMIN(CUD)           | GET, POST, PUT, PUT(toggle), DELETE                            |
| `/api/lich-tap`             | ✅   | Various                        | GET(any), POST(HOIVIEN), PUT cancel(HOIVIEN), PUT complete(PT) |

---

## 4. 🚨 Critical Business Rules (KHÔNG ĐƯỢC VI PHẠM)

1. ✅ Không đặt lịch trong quá khứ
2. ✅ Mỗi slot (gioTapId + ngayTapId) chỉ 1 booking duy nhất
3. ✅ Không hủy lịch trong vòng **2 giờ** trước buổi tập
4. ✅ Không xóa slot đã có người đặt (`DaDat`)
5. ✅ Sau khi `DaHoanThanh` → **KHÔNG rollback**
6. ✅ Khi PT hoàn thành → trừ vào khóa tập **cũ nhất còn buổi** (sort `ngayDangKy` ascending)
7. ✅ Nếu `soBuoiConLai = 0` → Không cho đặt thêm
8. ✅ Hội viên chỉ thấy slot/PT của khóa tập hiện tại
9. ✅ Dùng **MongoDB Transaction** khi trừ buổi (bookSession, cancelSession, completeSession)
10. ✅ Emit socket **SAU KHI** transaction thành công

---

## 5. Auth System

- **Admin**: Login bằng `taiKhoan` (username) + `matKhau` → JWT `{ id, vaiTro: "ADMIN", hoTen }`
- **PT/HoiVien**: Login bằng `soDienThoai` + `matKhau` → JWT `{ id, vaiTro, hoTen }`
- JWT stored in `localStorage`, sent via `Authorization: Bearer <token>`
- Password default = phone number khi admin tạo tài khoản
- Middleware: [auth.js](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/middleware/auth.js) (verify JWT) → [role.js](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/backend/middleware/role.js) (check vaiTro)

---

## 6. Frontend Architecture

### 6.1 Routing Structure

```
/login → LoginPage
/member → ProtectedRoute(HOIVIEN) → Sidebar + Outlet
  ├── / → DashboardPage
  ├── /schedule → SchedulePage  
  ├── /booking → BookingPage
  ├── /profile → ProfilePage
  └── /change-password → ChangePasswordPage
/pt → ProtectedRoute(PT) → Sidebar + Outlet
  ├── / → SchedulePage
  ├── /session/:id → SessionDetailPage
  ├── /session/:id/status → SessionStatusPage
  └── /profile → ProfilePage
/admin → ProtectedRoute(ADMIN) → Sidebar + Outlet
  ├── /khoa-tap → KhoaTapPage
  ├── /tai-khoan → TaiKhoanPage
  ├── /dang-ky-khoa → DangKyKhoaPage
  └── /lich-tap → LichTapPage
```

### 6.2 Shared Components

| Component                                                                                                                                                                | Purpose                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| [Sidebar](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/Sidebar.jsx#29-141)             | Navigation sidebar with role-based menu (icons from `/icon/`) |
| [DataTable](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/DataTable.jsx#3-93)           | Reusable table with columns config, delete, renderActions       |
| [Modal](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/Modal.jsx#1-63)                   | Generic modal overlay with title + children                     |
| [ConfirmModal](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/ConfirmModal.jsx#1-102)    | Delete confirmation with "Hủy" / "Xoá" buttons                |
| [SuccessModal](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/SuccessModal.jsx#3-87)     | Auto-close (2s) success notification with green checkmark       |
| [ProtectedRoute](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/ProtectedRoute.jsx#5-24) | Auth guard + layout (Sidebar + TopBar + Outlet)                 |
| [UserInfo](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/components/UserInfo.jsx#8-81)             | Bottom sidebar user info + logout button                        |

### 6.3 Services

- [api.js](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/services/api.js): Axios instance with baseURL, auth interceptor, 401 redirect
- [authService.js](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/services/authService.js): login, changePassword
- [socketService.js](file:///d:/%C4%90%E1%BA%A1i%20h%E1%BB%8Dc/Ki%E1%BB%83m%20th%E1%BB%AD%20ph%E1%BA%A7n%20m%E1%BB%81m/Project/frontend/src/services/socketService.js): connect/disconnect/on/off wrapper for Socket.io

### 6.4 Context

- `AuthContext`: user, token, loading, login(), logout() — JWT decode with UTF-8 Vietnamese support

### 6.5 Design System (CSS Variables)

```css
--color-primary: #3b61f0  --color-primary-light: #6b8af2  --color-primary-dark: #2a4ad0
--color-success: #22c55e  --color-warning: #f59e0b  --color-danger: #ef4444
--color-bg: #f8f9fa  --color-white: #fff  --color-text: #1f2937  --color-text-light: #6b7280
--sidebar-width: 260px  --topbar-height: 60px  --font-family: "Inter"
--radius: 8px  --radius-lg: 12px
```

### 6.6 Status Enum Mapping (Vietnamese)

| Backend Enum      | Frontend Display                   |
| ----------------- | ---------------------------------- |
| `HoatDong`      | Active / Đang hoạt động        |
| `NgungHoatDong` | Inactive / Ngừng hoạt động     |
| `DaDat`         | Đã đặt / Chờ tập (PT view)   |
| `DaHoanThanh`   | Đã hoàn thành                  |
| `DaHuy`         | Đã hủy                          |
| `Trong`         | Trống / Đang hoạt động (slot) |
| `Tat`           | Đã tắt (slot/day)               |

---

## 7. Socket.io Events

| Event                 | When                 | Payload                                |
| --------------------- | -------------------- | -------------------------------------- |
| `slotUpdated`       | Book/Cancel slot     | `{ gioTapId, ngayTapId, trangThai }` |
| `sessionCompleted`  | PT completes session | `{ hoiVienId, soBuoiConLai }`        |
| `slotCreated`       | Admin creates slot   | slot object                            |
| `slotStatusChanged` | Admin toggles slot   | slot object                            |

---

## 8. Validation Rules

| Field                   | Rule                            |
| ----------------------- | ------------------------------- |
| `hoTen`               | 2-50 chars, no digits, required |
| `soDienThoai`         | Exactly 10 digits, unique       |
| `matKhau`             | ≥ 6 chars (default = phone)    |
| `ngaySinh`            | 18-100 years old                |
| `gioiTinh`            | Nam or Nữ                      |
| `tenKhoaTap`          | 2-50 chars, unique              |
| `soBuoi`              | 1-40                            |
| `trangThai (User)`    | HoatDong / NgungHoatDong        |
| `trangThai (LichTap)` | DaDat / DaHoanThanh / DaHuy     |

---

## 9. Available Skills

| Skill                                 | Trigger                                                                         | Location            |
| ------------------------------------- | ------------------------------------------------------------------------------- | ------------------- |
| **vercel-composition-patterns** | Refactoring components, compound components, context providers                  | `.agents/skills/` |
| **vercel-react-best-practices** | Writing/reviewing React code, performance optimization (57 rules, 8 categories) | `.agents/skills/` |
| **vercel-react-native-skills**  | React Native/Expo (NOT applicable for this web project)                         | `.agents/skills/` |
| **web-design-guidelines**       | "review my UI", "check accessibility", "audit design"                           | `.agents/skills/` |

### Skill Selection Rules:

- 🔵 **Writing React components** → Read `vercel-react-best-practices` SKILL.md first
- 🔵 **Refactoring component architecture** → Read `vercel-composition-patterns` SKILL.md first
- 🔵 **Reviewing UI/UX** → Read `web-design-guidelines` SKILL.md first
- ⚪ **React Native** → Not applicable (this is a web project)

---

## 10. Available Workflows (Slash Commands)

| Command                | Purpose                         |
| ---------------------- | ------------------------------- |
| `/audit`             | 🏥 Code & security audit        |
| `/code`              | 💻 Write code from spec         |
| `/debug`             | 🐞 Fix bugs & debug             |
| `/deploy`            | 🚀 Deploy to production         |
| `/init`              | ✨ Create new project           |
| `/plan`              | 📝 Design features              |
| `/recap`             | 🧠 Project summary              |
| `/refactor`          | 🧹 Clean up & optimize code     |
| `/rollback`          | ⏪ Rollback to previous version |
| `/run`               | ▶️ Run application            |
| `/save_brain`        | 💾 Save project knowledge       |
| `/test`              | ✅ Run tests                    |
| `/visualize`         | 🎨 Design UI                    |
| `/cloudflare-tunnel` | 🌐 Manage Cloudflare Tunnel     |

---

## 11. Test Accounts (from seed.js)

| Role             | Credentials                    |
| ---------------- | ------------------------------ |
| **Admin**  | `admin` / `admin123`       |
| **PT**     | `0901000001` / `pt123456`  |
| **Member** | `0901000002` / `member123` |

---

## 12. Key Patterns to Follow

1. **Error handling**: All controllers use `try/catch/next(error)` pattern → centralized `errorHandler.js`
2. **Mongoose errors**: Handle code `11000` (duplicate key), `ValidationError`, `CastError`
3. **Password**: Never return `matKhau` in API response (`.select('-matKhau')`)
4. **Date format**: Display as `DD/MM/YYYY` in frontend
5. **Time format**: 24-hour format (HH:mm)
6. **Styling**: Inline `<style>` JSX in each component (no CSS modules)
7. **Icons**: Custom PNG icons from `src/icon/` folder
8. **Modals**: Use `Modal` for forms, `ConfirmModal` for deletes, `SuccessModal` after actions
9. **Tables**: Use `DataTable` component with `columns` config
10. **API**: Always use `api.js` axios instance (auto-attaches JWT token)
