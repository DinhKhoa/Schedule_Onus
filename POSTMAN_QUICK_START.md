# 🚀 HƯỚNG DẪN NHANH - TEST API VỚI POSTMAN

## 📥 Bước 1: Import vào Postman

### Cách 1: Import Collection và Environment
1. Mở **Postman**
2. Click **Import** (góc trên bên trái)
3. Kéo thả hoặc chọn 2 files:
   - `ONUS_Fitness_API.postman_collection.json`
   - `ONUS_Fitness.postman_environment.json`
4. Click **Import**

### Cách 2: Import từ link (nếu có)
1. Click **Import** → **Link**
2. Paste link của collection
3. Click **Continue** → **Import**

---

## ⚙️ Bước 2: Chọn Environment

1. Góc trên bên phải, click dropdown **"No Environment"**
2. Chọn **"ONUS Fitness - Local"**
3. Kiểm tra `BASE_URL` = `http://localhost:5000/api`

---

## 🔥 Bước 3: Chạy Backend Server

Trước khi test, đảm bảo backend đang chạy:

```bash
# Từ thư mục root của project
npm run backend

# Hoặc
cd backend
npm run dev
```

Kiểm tra server đã chạy: `http://localhost:5000`

---

## ✅ Bước 4: Test Flow - UC-1, UC-2 (Authentication)

### Test 1: Login thành công với ADMIN
1. Mở folder **"Authentication (UC-1, UC-2)"**
2. Click request **"Login - ADMIN"**
3. Click **Send**
4. ✅ Kết quả mong đợi:
   - Status: `200 OK`
   - Response có `token` và `user`
   - Token tự động lưu vào biến `TOKEN`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "fullName": "Admin",
    "role": "ADMIN"
  }
}
```

### Test 2: Login với MEMBER
1. Click request **"Login - MEMBER"**
2. Click **Send**
3. ✅ Status: `200 OK`

### Test 3: Login với TRAINER
1. Click request **"Login - TRAINER"**
2. Click **Send**
3. ✅ Status: `200 OK`

### Test 4: Login sai mật khẩu (Test Error)
1. Click request **"Login - Wrong Password (Test Error)"**
2. Click **Send**
3. ✅ Kết quả mong đợi:
   - Status: `401 Unauthorized`
   - Response: `{ "error": "Mật khẩu không đúng" }`

### Test 5: Login tài khoản không tồn tại (Test Error)
1. Click request **"Login - Account Not Found (Test Error)"**
2. Click **Send**
3. ✅ Kết quả mong đợi:
   - Status: `401 Unauthorized`
   - Response: `{ "error": "Tài khoản không tồn tại" }`

### Test 6: Đổi mật khẩu thành công
1. **Đảm bảo đã login ADMIN** (có TOKEN)
2. Click request **"Change Password - Success"**
3. Sửa body nếu cần:
```json
{
  "oldPassword": "admin123",
  "newPassword": "newadmin123"
}
```
4. Click **Send**
5. ✅ Status: `200 OK`, Response: `{ "message": "Đổi mật khẩu thành công" }`

⚠️ **LƯU Ý**: Sau khi đổi mật khẩu, phải login lại với mật khẩu mới!

### Test 7: Đổi mật khẩu với mật khẩu cũ sai (Test Error)
1. Click request **"Change Password - Wrong Old Password (Test Error)"**
2. Click **Send**
3. ✅ Status: `400 Bad Request`, Response: `{ "error": "Mật khẩu cũ không đúng" }`

---

## ✅ Bước 5: Test Flow - UC-7.1, UC-7.2 (Course Package)

### Test 1: Xem danh sách khóa tập
1. **Login ADMIN trước** (để có TOKEN)
2. Mở folder **"Course Package (UC-7.1, UC-7.2)"**
3. Click request **"Get All Course Packages"**
4. Click **Send**
5. ✅ Status: `200 OK`, Response: Array of course packages

### Test 2: Tìm kiếm khóa tập
1. Click request **"Get All Course Packages - With Search"**
2. Sửa query param `search` nếu muốn (ví dụ: "VIP", "cơ bản")
3. Click **Send**
4. ✅ Status: `200 OK`, Response: Filtered array

### Test 3: Thêm khóa tập mới (ADMIN)
1. Click request **"Create Course Package - Success (ADMIN)"**
2. Sửa body nếu muốn:
```json
{
  "name": "Khóa tập Test của tôi",
  "totalSessions": 30
}
```
3. Click **Send**
4. ✅ Status: `201 Created`
5. **LƯU LẠI `_id`** trong response để dùng cho test sau!

### Test 4: Xem chi tiết khóa tập
1. Click request **"Get Course Package By ID"**
2. Thay `:id` trong URL bằng ID vừa tạo
3. Click **Send**
4. ✅ Status: `200 OK`

### Test 5: Cập nhật khóa tập (ADMIN)
1. Click request **"Update Course Package - Success (ADMIN)"**
2. Thay `:id` trong URL
3. Sửa body:
```json
{
  "name": "Khóa tập Test Updated",
  "totalSessions": 35
}
```
4. Click **Send**
5. ✅ Status: `200 OK`

### Test 6: Xóa khóa tập (ADMIN)
1. Click request **"Delete Course Package - Success (ADMIN)"**
2. Thay `:id` trong URL
3. Click **Send**
4. ✅ Status: `200 OK`, Response: `{ "message": "Xóa khóa tập thành công" }`

### Test 7: Validation Errors

#### Test 7a: Tên khóa tập trống
1. Click **"Create Course Package - Missing Name (Test Error)"**
2. Click **Send**
3. ✅ Status: `400 Bad Request`, Response: `{ "error": "Tên khóa tập là bắt buộc" }`

#### Test 7b: Số buổi không hợp lệ
1. Click **"Create Course Package - Invalid Sessions (Test Error)"**
2. Click **Send**
3. ✅ Status: `400 Bad Request`, Response: `{ "error": "Số buổi phải lớn hơn 0" }`

#### Test 7c: Tên khóa tập trùng
1. Tạo khóa tập với tên "Khóa tập Test Postman"
2. Click **"Create Course Package - Duplicate Name (Test Error)"**
3. Click **Send**
4. ✅ Status: `400 Bad Request`, Response: `{ "error": "Tên khóa tập đã tồn tại" }`

### Test 8: Test Authorization (MEMBER không được tạo khóa tập)
1. **Login MEMBER** (chạy request "Login - MEMBER")
2. Thử chạy **"Create Course Package - Success (ADMIN)"**
3. ✅ Status: `403 Forbidden`, Response: `{ "error": "Không có quyền truy cập" }`

---

## 📊 Checklist Test Cases

### UC-1, UC-2: Authentication
- [x] Login ADMIN thành công
- [x] Login MEMBER thành công
- [x] Login TRAINER thành công
- [x] Login sai mật khẩu → 401
- [x] Login tài khoản không tồn tại → 401
- [x] Đổi mật khẩu thành công
- [x] Đổi mật khẩu sai mật khẩu cũ → 400
- [x] Đổi mật khẩu không có token → 401

### UC-7.1: Xem khóa tập
- [x] Xem danh sách khóa tập
- [x] Xem chi tiết khóa tập
- [x] Tìm kiếm khóa tập
- [x] Xem khóa tập không tồn tại → 404

### UC-7.2: Thêm khóa tập
- [x] Thêm khóa tập thành công (ADMIN)
- [x] Thêm khóa tập thiếu tên → 400
- [x] Thêm khóa tập số buổi < 1 → 400
- [x] Thêm khóa tập tên trùng → 400
- [x] Thêm khóa tập với MEMBER token → 403
- [x] Cập nhật khóa tập thành công
- [x] Xóa khóa tập thành công
- [x] Xóa khóa tập đã có người đăng ký → 400

---

## 🔍 Tips & Tricks

### 1. Xem Token hiện tại
- Click vào **Environment** (góc trên phải)
- Xem giá trị của biến `TOKEN`

### 2. Xem Console Log
- Mở **Postman Console** (View → Show Postman Console)
- Xem log khi token được lưu

### 3. Copy ID từ Response
- Sau khi tạo course package, copy `_id` từ response
- Paste vào các request khác thay cho `:id`

### 4. Test nhanh nhiều request
- Click vào folder (ví dụ "Authentication")
- Click **Run** (góc trên phải)
- Chọn requests muốn chạy
- Click **Run ONUS Fitness API**

### 5. Export Test Results
- Sau khi chạy Collection Runner
- Click **Export Results**
- Lưu file JSON hoặc HTML

---

## 🐛 Troubleshooting

### Lỗi: "Could not get any response"
- ✅ Kiểm tra backend đã chạy chưa: `http://localhost:5000`
- ✅ Kiểm tra `BASE_URL` trong Environment

### Lỗi: 401 Unauthorized
- ✅ Chạy lại request Login để lấy token mới
- ✅ Kiểm tra token đã được lưu vào biến `TOKEN`

### Lỗi: 403 Forbidden
- ✅ Kiểm tra role của user (ADMIN/MEMBER/TRAINER)
- ✅ Đảm bảo đang dùng đúng token cho đúng role

### Lỗi: 404 Not Found
- ✅ Kiểm tra ID trong URL có đúng không
- ✅ Kiểm tra resource có tồn tại trong database không

### Token hết hạn
- ✅ Login lại để lấy token mới
- ✅ Token mặc định hết hạn sau 7 ngày

---

## 📝 Ghi chú quan trọng

1. **Luôn login trước khi test các API khác**
2. **Lưu lại ID** sau khi tạo resource để dùng cho test update/delete
3. **Kiểm tra role** - Một số API chỉ ADMIN mới được dùng
4. **Đọc response error** để hiểu lỗi validation
5. **Dùng Collection Runner** để test hàng loạt

---

## 🎯 Test Scenarios Nâng cao

### Scenario 1: Full CRUD Course Package
1. Login ADMIN
2. Tạo khóa tập mới
3. Xem danh sách (kiểm tra khóa vừa tạo có trong list)
4. Xem chi tiết khóa vừa tạo
5. Cập nhật khóa tập
6. Xóa khóa tập

### Scenario 2: Authorization Testing
1. Login MEMBER
2. Thử tạo khóa tập → Expect 403
3. Thử xóa khóa tập → Expect 403
4. Xem danh sách khóa tập → Expect 200 (được phép)

### Scenario 3: Validation Testing
1. Login ADMIN
2. Thử tạo khóa tập với tên trống → Expect 400
3. Thử tạo khóa tập với totalSessions = 0 → Expect 400
4. Tạo khóa tập hợp lệ
5. Thử tạo khóa tập trùng tên → Expect 400

---

Chúc bạn test thành công! 🎉
