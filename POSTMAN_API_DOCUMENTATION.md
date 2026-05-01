# 📋 ONUS FITNESS API DOCUMENTATION - POSTMAN TESTING

## 🔗 Base URL
- **Local**: `http://localhost:5000/api`
- **Production**: `https://your-vercel-app.vercel.app/api`

---

## 🔐 AUTHENTICATION (UC-1, UC-2)

### 1. Đăng nhập (Login)
**POST** `/auth/login`

**Request Body:**
```json
{
  "phoneNumber": "0123456789",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "Nguyễn Văn A",
    "role": "MEMBER",
    "gender": "Male"
  }
}
```

**Response Error (401):**
```json
{
  "error": "Tài khoản không tồn tại"
}
```
hoặc
```json
{
  "error": "Mật khẩu không đúng"
}
```

**Response Error (403):**
```json
{
  "error": "Tài khoản đã bị khóa"
}
```

**Test Cases:**
- ✅ Login với ADMIN: `phoneNumber: "admin"`, `password: "admin123"`
- ✅ Login với MEMBER: `phoneNumber: "0987654321"`, `password: "member123"`
- ✅ Login với TRAINER: `phoneNumber: "0912345678"`, `password: "trainer123"`
- ❌ Sai mật khẩu
- ❌ Tài khoản không tồn tại
- ❌ Tài khoản bị khóa (status: "Inactive")

---

### 2. Đổi mật khẩu (Change Password)
**PUT** `/auth/change-password`  
**POST** `/auth/change-password` (cũng được hỗ trợ)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response Success (200):**
```json
{
  "message": "Đổi mật khẩu thành công"
}
```

**Response Error (400):**
```json
{
  "error": "Mật khẩu cũ không đúng"
}
```

**Test Cases:**
- ✅ Đổi mật khẩu thành công
- ❌ Mật khẩu cũ sai
- ❌ Thiếu oldPassword hoặc newPassword
- ❌ Không có token (401 Unauthorized)

---

## 📦 KHÓA TẬP (COURSE PACKAGE) - UC-7.1, UC-7.2

### 3. Xem danh sách khóa tập (Get All)
**GET** `/course-package`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (Optional):**
- `search`: Tìm kiếm theo tên khóa tập

**Example:**
```
GET /course-package?search=cơ bản
```

**Response Success (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Khóa tập cơ bản",
    "totalSessions": 12,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Khóa tập nâng cao",
    "totalSessions": 24,
    "createdAt": "2024-01-16T11:00:00.000Z",
    "updatedAt": "2024-01-16T11:00:00.000Z"
  }
]
```

**Test Cases:**
- ✅ Xem tất cả khóa tập
- ✅ Tìm kiếm khóa tập theo tên
- ❌ Không có token (401)

---

### 4. Xem chi tiết khóa tập (Get By ID)
**GET** `/course-package/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Example:**
```
GET /course-package/507f1f77bcf86cd799439011
```

**Response Success (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Khóa tập cơ bản",
  "totalSessions": 12,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Response Error (404):**
```json
{
  "error": "Không tìm thấy khóa tập"
}
```

---

### 5. Thêm khóa tập (Create) - ADMIN ONLY
**POST** `/course-package`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Khóa tập VIP",
  "totalSessions": 36
}
```

**Response Success (201):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Khóa tập VIP",
  "totalSessions": 36,
  "createdAt": "2024-01-17T09:00:00.000Z",
  "updatedAt": "2024-01-17T09:00:00.000Z"
}
```

**Response Error (400):**
```json
{
  "error": "Tên khóa tập là bắt buộc"
}
```
hoặc
```json
{
  "error": "Số buổi phải lớn hơn 0"
}
```
hoặc
```json
{
  "error": "Tên khóa tập đã tồn tại"
}
```

**Response Error (403):**
```json
{
  "error": "Không có quyền truy cập"
}
```

**Test Cases:**
- ✅ Thêm khóa tập thành công (với ADMIN token)
- ❌ Thiếu tên khóa tập
- ❌ Số buổi < 1
- ❌ Tên khóa tập trùng
- ❌ Không phải ADMIN (403)

---

### 6. Cập nhật khóa tập (Update) - ADMIN ONLY
**PUT** `/course-package/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Khóa tập VIP Plus",
  "totalSessions": 48
}
```

**Response Success (200):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Khóa tập VIP Plus",
  "totalSessions": 48,
  "createdAt": "2024-01-17T09:00:00.000Z",
  "updatedAt": "2024-01-17T10:30:00.000Z"
}
```

**Response Error (404):**
```json
{
  "error": "Không tìm thấy khóa tập"
}
```

**Test Cases:**
- ✅ Cập nhật thành công
- ❌ ID không tồn tại
- ❌ Tên trùng với khóa tập khác
- ❌ Không phải ADMIN

---

### 7. Xóa khóa tập (Delete) - ADMIN ONLY
**DELETE** `/course-package/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "message": "Xóa khóa tập thành công"
}
```

**Response Error (400):**
```json
{
  "error": "Không thể xóa khóa tập này vì đã có hội viên đăng ký. Vui lòng kiểm tra lại."
}
```

**Test Cases:**
- ✅ Xóa khóa tập chưa có ai đăng ký
- ❌ Xóa khóa tập đã có người đăng ký (400)
- ❌ ID không tồn tại (404)

---

## 👥 ĐĂNG KÝ KHÓA TẬP (ENROLLMENT)

### 8. Xem danh sách đăng ký
**GET** `/enrollment`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (Optional):**
- `search`: Tìm kiếm theo tên hội viên hoặc tên khóa tập (chỉ ADMIN)

**Response Success (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "memberId": {
      "_id": "507f1f77bcf86cd799439015",
      "fullName": "Nguyễn Văn A",
      "phoneNumber": "0987654321"
    },
    "packageId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Khóa tập cơ bản",
      "totalSessions": 12
    },
    "trainerId": {
      "_id": "507f1f77bcf86cd799439016",
      "fullName": "PT Thắng"
    },
    "registrationDate": "2024-01-20T08:00:00.000Z",
    "totalSessions": 12,
    "remainingSessions": 10,
    "createdAt": "2024-01-20T08:00:00.000Z",
    "updatedAt": "2024-01-22T10:00:00.000Z"
  }
]
```

**Note:**
- MEMBER chỉ xem được đăng ký của chính mình
- ADMIN/TRAINER xem được tất cả

---

### 9. Thêm đăng ký khóa tập - ADMIN ONLY
**POST** `/enrollment`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "memberId": "507f1f77bcf86cd799439015",
  "packageId": "507f1f77bcf86cd799439011",
  "trainerId": "507f1f77bcf86cd799439016",
  "registrationDate": "2024-01-20T08:00:00.000Z"
}
```

**Response Success (201):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "memberId": {
    "_id": "507f1f77bcf86cd799439015",
    "fullName": "Nguyễn Văn A"
  },
  "packageId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Khóa tập cơ bản",
    "totalSessions": 12
  },
  "trainerId": {
    "_id": "507f1f77bcf86cd799439016",
    "fullName": "PT Thắng"
  },
  "registrationDate": "2024-01-20T08:00:00.000Z",
  "totalSessions": 12,
  "remainingSessions": 12,
  "createdAt": "2024-01-20T08:00:00.000Z",
  "updatedAt": "2024-01-20T08:00:00.000Z"
}
```

**Response Error (400):**
```json
{
  "error": "Hội viên đã đăng ký khóa tập này với PT này và vẫn còn buổi tập"
}
```

**Test Cases:**
- ✅ Đăng ký thành công
- ❌ Thiếu memberId, packageId, hoặc trainerId
- ❌ Member không hợp lệ (không tồn tại hoặc role không phải MEMBER)
- ❌ Trainer không hợp lệ
- ❌ Package không tồn tại
- ❌ Đã đăng ký khóa tập này và còn buổi tập

---

### 10. Xóa đăng ký - ADMIN ONLY
**DELETE** `/enrollment/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response Success (200):**
```json
{
  "message": "Xóa đăng ký thành công"
}
```

**Response Error (400):**
```json
{
  "error": "Không thể xóa gói tập đã có lịch sử tập luyện hoặc đang có lịch đặt. Vui lòng kiểm tra lại."
}
```

---

## 👤 USER MANAGEMENT

### 11. Xem profile của chính mình
**GET** `/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

---

### 12. Cập nhật profile
**PUT** `/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654322",
  "gender": "Male"
}
```

---

### 13. Xem danh sách users - ADMIN ONLY
**GET** `/users`

**Headers:**
```
Authorization: Bearer <token>
```

---

### 14. Thêm user - ADMIN ONLY
**POST** `/users`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn C",
  "phoneNumber": "0123456789",
  "password": "password123",
  "role": "MEMBER",
  "gender": "Male",
  "status": "Active"
}
```

---

### 15. Cập nhật user - ADMIN ONLY
**PUT** `/users/:id`

---

### 16. Xóa user - ADMIN ONLY
**DELETE** `/users/:id`

---

## 📅 BOOKING (ĐẶT LỊCH TẬP)

### 17. Xem danh sách booking
**GET** `/booking`

**Headers:**
```
Authorization: Bearer <token>
```

---

### 18. Đặt lịch tập - MEMBER ONLY
**POST** `/booking`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "enrollmentId": "507f1f77bcf86cd799439020",
  "trainingDateId": "507f1f77bcf86cd799439030",
  "timeSlotId": "507f1f77bcf86cd799439040"
}
```

---

### 19. Hủy lịch - MEMBER ONLY
**PUT** `/booking/:id/cancel`

---

### 20. Chấp nhận lịch - TRAINER ONLY
**PUT** `/booking/:id/accept`

---

### 21. Từ chối lịch - TRAINER ONLY
**PUT** `/booking/:id/reject`

---

### 22. Hoàn thành buổi tập - TRAINER ONLY
**PUT** `/booking/:id/complete`

---

## 📊 ADDITIONAL ENDPOINTS

### Training Dates
- **GET** `/training-date` - Xem ngày tập
- **POST** `/training-date` - Thêm ngày tập (ADMIN)
- **PUT** `/training-date/:id` - Cập nhật (ADMIN)

### Time Slots
- **GET** `/time-slot` - Xem giờ tập
- **POST** `/time-slot` - Thêm giờ tập (ADMIN)
- **PUT** `/time-slot/:id` - Cập nhật (ADMIN)
- **PUT** `/time-slot/:id/toggle` - Bật/tắt giờ tập (ADMIN)
- **DELETE** `/time-slot/:id` - Xóa (ADMIN)

### Slot Status
- **GET** `/slot-status` - Xem trạng thái slot
- **PUT** `/slot-status/toggle-slot` - Bật/tắt slot cho ngày (ADMIN)
- **PUT** `/slot-status/toggle-global` - Bật/tắt slot toàn bộ (ADMIN)
- **PUT** `/slot-status/toggle-day` - Bật/tắt cả ngày (ADMIN)

### Trainer Availability
- **GET** `/trainer-availability` - Xem lịch PT (ADMIN/TRAINER)
- **PUT** `/trainer-availability/toggle-day` - Bật/tắt ngày (ADMIN)
- **PUT** `/trainer-availability/toggle-slot` - Bật/tắt slot (ADMIN)
- **PUT** `/trainer-availability/toggle-slot-global` - Bật/tắt slot toàn bộ (ADMIN)

---

## 🔑 ROLES & PERMISSIONS

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access - Quản lý tất cả |
| **TRAINER** | Xem và quản lý lịch tập của mình, chấp nhận/từ chối/hoàn thành booking |
| **MEMBER** | Xem thông tin, đặt lịch, hủy lịch của mình |

---

## 🧪 POSTMAN SETUP

### 1. Tạo Environment
```
BASE_URL: http://localhost:5000/api
TOKEN: (sẽ được set sau khi login)
```

### 2. Pre-request Script cho Authorization
Trong Collection settings, thêm:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('TOKEN')
});
```

### 3. Test Script cho Login
Trong Login request, tab "Tests":
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("TOKEN", jsonData.token);
    console.log("Token saved:", jsonData.token);
}
```

---

## ✅ TEST SCENARIOS

### Scenario 1: Login Flow (UC-1, UC-2)
1. Login với ADMIN → Lưu token
2. Login với MEMBER → Lưu token
3. Login với TRAINER → Lưu token
4. Test login sai mật khẩu
5. Test login tài khoản không tồn tại
6. Đổi mật khẩu thành công
7. Đổi mật khẩu với mật khẩu cũ sai

### Scenario 2: Course Package Management (UC-7.1, UC-7.2)
1. Login ADMIN
2. Xem danh sách khóa tập
3. Thêm khóa tập mới
4. Xem chi tiết khóa tập
5. Cập nhật khóa tập
6. Tìm kiếm khóa tập
7. Thử xóa khóa tập (nếu chưa có ai đăng ký)
8. Test validation: tên trống, số buổi < 1, tên trùng
9. Test với MEMBER token (phải bị 403)

---

## 📝 NOTES

- Tất cả API (trừ `/auth/login`) đều cần **Authorization header**
- Token format: `Bearer <token>`
- Token expires theo `JWT_EXPIRES_IN` trong .env (mặc định 7 ngày)
- Tất cả response error có format: `{ "error": "message" }`
- Tất cả datetime theo ISO 8601 format
