# PRIVATE FITNESS BOOKING SYSTEM (ONUS GYM)

## 1. Tổng Quan Dự Án

### 1.1 Giới thiệu

Private Fitness Booking System là hệ thống đặt lịch tập luyện trực tuyến dành cho phòng gym.

Hệ thống cho phép:

- Hội viên chủ động đặt lịch tập theo slot còn trống
- PT quản lý lịch dạy cá nhân
- Quản trị viên quản lý toàn bộ hệ thống (slot, tài khoản, khóa tập, đăng ký khóa, v.v.)

Đồng bộ dữ liệu theo thời gian thực (real-time)

### 1.2 Vấn đề hiện tại

Hiện nay quy trình đặt lịch:

Thực hiện thủ công qua mạng xã hội hoặc điện thoại

PT tự ghi nhớ lịch → dễ trùng lịch

Quản lý không có dashboard tổng quan

Dữ liệu phân tán, không tập trung

### 1.3 Mục tiêu hệ thống

Tự động hóa đặt lịch

Kiểm soát số buổi còn lại của hội viên

Quản lý tập trung

Đồng bộ trạng thái real-time

Phân quyền rõ ràng theo vai trò

## 2. Kiến Trúc Hệ Thống

### 2.1 Tech Stack

#### Frontend

ReactJS hoặc NextJS

Axios

Socket.io Client (real-time)

Context API hoặc Redux (state management)

#### Backend

NodeJS

ExpressJS

JWT Authentication

Socket.io Server

#### Database

MongoDB (NoSQL)

## 3. Thiết Kế Authentication

### 3.1 Thiết kế bảng theo yêu cầu

Tách thành 2 nhóm chính trong database:

#### 3.1.1 Collection: QuanTriVien

```javascript
{
  _id,
  username,
  passwordHash,
  createdAt,
  updatedAt
}
```

#### 3.1.2 Collection: Users (chứa cả PT và Hội viên)

```javascript
{
  _id,
  phone,
  passwordHash,
  vaiTro: "HOIVIEN" | "PT",
  hoTen,
  ngaySinh,
  gioiTinh,
  trangThai: "ACTIVE" | "INACTIVE",
  createdAt,
  updatedAt
}
```

### 3.2 JWT + Middleware

#### Login Flow

1. User nhập phone/password
2. Server xác thực
3. Tạo JWT gồm:

   ```javascript
   {
     userId,
     role,
     exp
   }
   ```

4. Trả về accessToken

### 3.3 Auth Middleware

#### verifyToken()

- Kiểm tra JWT
- Decode role
- Gắn vào req.user

#### authorizeRole(role)

- `authorizeRole("ADMIN")`
- `authorizeRole("PT")`
- `authorizeRole("HOIVIEN")`

## 4. Thiết Kế Database MongoDB

### 4.1 KhoaTap

```javascript
{
  _id,
  ten,
  soBuoi,
  createdAt,
  updatedAt
}
```

### 4.2 DangKyKhoaTap

```javascript
{
  _id,
  hoiVienId,
  ptId,
  khoaTapId,
  soBuoiConLai,
  ngayDangKy,
  createdAt,
  updatedAt
}
```

### 4.3 GioTap

```javascript
{
  _id,
  gioBatDau,
  gioKetThuc,
  trangThai: "ACTIVE" | "INACTIVE",
  createdAt,
  updatedAt
}
```

### 4.4 NgayTap

```javascript
{
  _id,
  thoiGianTap,
  trangThai: "ACTIVE" | "INACTIVE",
  createdAt,
  updatedAt
}
```

### 4.5 LichTap

```javascript
{
  _id,
  ngayTapId,
  gioTapId,
  dangKyKhoaTapId,
  trangThai: "BOOKED" | "COMPLETED" | "CANCELLED",
  createdAt,
  updatedAt
}
```

## 5. Quyền Hệ Thống

### 5.1 Hội viên

- Xem lịch cá nhân
- Đặt lịch
- Hủy lịch (trước 2 tiếng)
- Cập nhật thông tin cá nhân

### 5.2 PT

- Xem lịch dạy cá nhân
- Cập nhật trạng thái buổi tập
- Không chỉnh sửa slot

### 5.3 Quản trị viên

- Thêm/sửa/xóa slot
- Thêm/sửa khóa tập
- Tạo đăng ký khóa
- Phân quyền tài khoản
- Xem dashboard tổng quan

## 6. Cơ Chế Real-time

### 6.1 Công nghệ

- Socket.io

### 6.2 Các sự kiện real-time

#### Khi hội viên đặt lịch

- Emit: `slotUpdated`
- Frontend của:
  - Hội viên khác
  - PT
  - Admin
- → Cập nhật slot ngay lập tức

#### Khi PT hoàn thành buổi tập

- Emit: `sessionCompleted`
- → Trừ `soBuoiConLai`
- → Cập nhật UI hội viên ngay

#### Khi admin thay đổi trạng thái slot

- Emit: `slotStatusChanged`

## 7. Business Rules Quan Trọng

- Không đặt lịch trong quá khứ
- Mỗi slot chỉ 1 hội viên / 1 PT
- Không hủy trước 2 tiếng
- Không xóa slot đã có người đặt
- Sau khi đánh dấu COMPLETED → không rollback
- Khi PT hoàn thành → trừ buổi còn lại
- Nếu `soBuoiConLai` = 0 → không cho đặt tiếp

## 8. Yêu Cầu Phi Chức Năng

### 8.1 Performance

- Response < 2s
- Index MongoDB cho:
  - `phone`
  - `date`
  - `slotId`

### 8.2 Security

- Hash password (bcrypt)
- JWT expiration
- Refresh token nếu cần
- Không trả `passwordHash`

### 8.3 Availability

- Hệ thống phải hoạt động 24/7
- Real-time không được trễ > 2s

## 9. Điều Kiện & Quy Tắc Sử Dụng Hệ Thống (System Usage Conditions)

Phần này định nghĩa các ràng buộc nghiệp vụ cốt lõi liên quan đến Hội viên – PT – Khóa tập.

### 9.1 Quy tắc về đăng ký nhiều khóa tập

#### Điều kiện

- Một Hội viên được phép đăng ký nhiều khóa tập khác nhau.
- Mỗi khóa tập sẽ gắn với:
  - 1 PT phụ trách
  - Số buổi tập riêng biệt (`soBuoiConLai`)

#### Quy tắc hiển thị PT khi đặt lịch

- Nếu Hội viên đang có một khóa tập còn buổi (`soBuoiConLai` > 0)
  - → Khi vào trang đặt lịch:
    - Chỉ hiển thị PT của khóa tập còn hiệu lực gần nhất
    - Không hiển thị PT của các khóa khác nếu khóa hiện tại chưa hết buổi

#### Logic hệ thống

Khi load trang đặt lịch:

1. Lấy danh sách đăng ký khóa của hội viên
2. Sắp xếp theo ngày đăng ký tăng dần
3. Lọc khóa có `soBuoiConLai` > 0
4. Lấy khóa xa nhất còn hiệu lực
5. Chỉ hiển thị PT của khóa đó

### 9.2 Hiển thị lịch tập khi đăng nhập

Khi Hội viên đăng nhập:

- Hệ thống chỉ hiển thị:
  - Lịch tập thuộc khóa hiện tại (khóa còn buổi)
  - Lịch của PT tương ứng với khóa đó
- Hội viên sẽ không thấy lịch của PT khác nếu không thuộc khóa họ đang sử dụng

#### Mục tiêu

- Tránh nhầm lẫn giữa nhiều PT
- Đảm bảo tính nhất quán khóa – PT – lịch tập
- Giảm sai sót khi đặt nhầm PT

### 9.3 Quy tắc trừ buổi tập khi hoàn thành

#### Khi buổi tập kết thúc

1. PT nhấn "Hoàn thành"
2. Hệ thống:
   - Xác nhận thời gian buổi tập đã diễn ra
   - Cập nhật `LichTap.trangThai` = COMPLETED
   - Trừ 1 buổi vào khóa tập hợp lệ

#### Nguyên tắc trừ buổi

- Hệ thống sẽ trừ vào: Khóa tập gần nhất còn buổi (theo thứ tự đăng ký cũ nhất còn hiệu lực)

#### Logic

1. Lấy tất cả `DangKyKhoaTap` của hội viên
2. Sắp xếp theo `ngayDangKy` tăng dần
3. Lọc `soBuoiConLai` > 0
4. Trừ vào bản ghi đầu tiên

### 9.4 Quy tắc hủy trong vòng 2 tiếng

#### Trường hợp đặc biệt

Nếu Hội viên:

- Hủy lịch trong vòng 2 tiếng trước giờ tập
- → Hệ thống vẫn cho PT quyền:
  - Xác nhận "Hoàn thành"
  - Trừ buổi tập như bình thường

#### Phân biệt hai trường hợp hủy

| Thời điểm hủy | Kết quả                                         |
| ------------- | ----------------------------------------------- |
| Trước 2 tiếng | Hủy hợp lệ – Không trừ buổi                     |
| Trong 2 tiếng | PT vẫn có quyền xác nhận hoàn thành và trừ buổi |

## 10. Đảm Bảo Tính Nhất Quán Dữ Liệu

Để tránh race-condition:

- Sử dụng MongoDB transaction khi:
  - PT xác nhận hoàn thành
  - Trừ buổi tập
- Lock logic ở service layer
- Emit socket sau khi transaction thành công
