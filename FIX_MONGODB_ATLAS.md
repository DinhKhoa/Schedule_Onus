# 🔧 FIX MONGODB ATLAS CONNECTION TIMEOUT

## ⚠️ Vấn đề: FUNCTION_INVOCATION_TIMEOUT

Lỗi này xảy ra khi Vercel không thể kết nối MongoDB Atlas trong thời gian cho phép.

---

## ✅ Giải pháp: Cho phép IP của Vercel truy cập MongoDB Atlas

### Bước 1: Vào MongoDB Atlas Dashboard
1. Truy cập: https://cloud.mongodb.com
2. Chọn cluster của bạn
3. Click **Network Access** (menu bên trái)

### Bước 2: Thêm IP Address
1. Click **+ ADD IP ADDRESS**
2. Chọn **ALLOW ACCESS FROM ANYWHERE**
3. Hoặc nhập: `0.0.0.0/0` (cho phép tất cả IP)
4. Comment: `Vercel Serverless Functions`
5. Click **Confirm**

⚠️ **Lưu ý bảo mật:** 
- `0.0.0.0/0` cho phép tất cả IP truy cập
- Nên kết hợp với username/password mạnh
- Hoặc dùng MongoDB Atlas IP Whitelist cho Vercel (phức tạp hơn)

---

## 🔍 Kiểm tra Connection String

### Bước 1: Lấy Connection String đúng
1. Vào MongoDB Atlas → Cluster
2. Click **Connect** → **Connect your application**
3. Chọn **Driver: Node.js**, **Version: 5.5 or later**
4. Copy connection string:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
```

### Bước 2: Thay thế các giá trị
- `<username>`: Username MongoDB của bạn
- `<password>`: Password (không có ký tự đặc biệt, hoặc encode URL)
- `<dbname>`: Tên database (ví dụ: `onus_fitness`)

**Ví dụ:**
```
mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/onus_fitness?retryWrites=true&w=majority
```

### Bước 3: Cập nhật trên Vercel
1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Tìm `MONGODB_URI`
3. Click **Edit** → Paste connection string mới
4. Click **Save**
5. **Redeploy** project

---

## 🧪 Test Connection Local

Trước khi deploy, test connection string ở local:

```bash
# Tạo file test
node backend/config/db.js
```

Hoặc tạo file `test-db.js`:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('Host:', mongoose.connection.host);
    console.log('Database:', mongoose.connection.name);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

test();
```

Chạy:
```bash
node test-db.js
```

---

## 🚨 Các lỗi thường gặp

### Lỗi 1: "MongooseServerSelectionError: Could not connect to any servers"
**Nguyên nhân:** IP chưa được whitelist trên MongoDB Atlas

**Giải pháp:**
- Thêm `0.0.0.0/0` vào Network Access
- Đợi 1-2 phút để MongoDB Atlas cập nhật

### Lỗi 2: "Authentication failed"
**Nguyên nhân:** Username/password sai

**Giải pháp:**
- Kiểm tra lại username/password
- Tạo user mới trên MongoDB Atlas:
  - Database Access → Add New Database User
  - Username: `admin`
  - Password: Tạo password mạnh (không có ký tự đặc biệt)
  - Database User Privileges: **Read and write to any database**

### Lỗi 3: "FUNCTION_INVOCATION_TIMEOUT"
**Nguyên nhân:** Connection mất quá nhiều thời gian

**Giải pháp:**
- Kiểm tra Network Access đã có `0.0.0.0/0`
- Tăng `maxDuration` trong `vercel.json` (đã tăng lên 30s)
- Kiểm tra MongoDB cluster có đang sleep không (Free tier M0 có thể sleep)

### Lỗi 4: "Invalid connection string"
**Nguyên nhân:** Connection string sai format

**Giải pháp:**
- Phải bắt đầu bằng `mongodb+srv://`
- Không có khoảng trắng
- Password có ký tự đặc biệt phải encode URL:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - Hoặc đổi password không có ký tự đặc biệt

---

## 📋 Checklist

- [ ] Đã thêm `0.0.0.0/0` vào Network Access trên MongoDB Atlas
- [ ] Đã đợi 1-2 phút sau khi thêm IP
- [ ] Connection string đúng format `mongodb+srv://...`
- [ ] Username/password đúng
- [ ] Database name đã được chỉ định trong connection string
- [ ] Đã test connection ở local thành công
- [ ] Đã cập nhật `MONGODB_URI` trên Vercel
- [ ] Đã redeploy sau khi cập nhật env vars
- [ ] `maxDuration` đã tăng lên 30s trong `vercel.json`

---

## 🎯 Kết quả mong đợi

Sau khi fix, API sẽ:
- ✅ Kết nối MongoDB trong < 5 giây
- ✅ Không bị timeout
- ✅ Login thành công và trả về token

Test:
```bash
curl -X POST https://schedule-onus.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"admin","password":"admin123"}'
```

Response mong đợi:
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

---

## 💡 Tips

1. **Dùng MongoDB Atlas M0 (Free tier):**
   - Đủ cho development và testing
   - Có thể sleep sau 60 ngày không hoạt động
   - Giới hạn 512MB storage

2. **Connection Pooling:**
   - Code đã được tối ưu để reuse connection
   - Giảm thời gian kết nối cho các request tiếp theo

3. **Monitor trên Vercel:**
   - Vào Deployments → View Function Logs
   - Xem log "MongoDB connected" hoặc lỗi connection

4. **Backup plan:**
   - Nếu vẫn timeout, có thể dùng MongoDB Atlas Serverless tier
   - Hoặc chuyển sang database khác như Supabase, PlanetScale
