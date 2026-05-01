# ⚙️ VERCEL ENVIRONMENT VARIABLES SETUP

## 🚨 QUAN TRỌNG: Phải cấu hình các biến môi trường sau trên Vercel Dashboard

### Bước 1: Vào Vercel Dashboard
1. Truy cập: https://vercel.com/dashboard
2. Chọn project: **Schedule_Onus**
3. Click **Settings** → **Environment Variables**

---

### Bước 2: Thêm các biến môi trường sau

#### 1. MONGODB_URI (BẮT BUỘC)
```
Key: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/onus_fitness?retryWrites=true&w=majority
Environment: Production, Preview, Development
```

**Lấy MongoDB URI:**
- Vào MongoDB Atlas: https://cloud.mongodb.com
- Chọn cluster → Connect → Connect your application
- Copy connection string
- Thay `<password>` bằng mật khẩu thật

#### 2. JWT_SECRET (BẮT BUỘC)
```
Key: JWT_SECRET
Value: onus_fitness_jwt_secret_key_2024
Environment: Production, Preview, Development
```

**Lưu ý:** Nên dùng secret key mạnh hơn cho production!

#### 3. JWT_EXPIRES_IN
```
Key: JWT_EXPIRES_IN
Value: 7d
Environment: Production, Preview, Development
```

#### 4. FRONTEND_URL
```
Key: FRONTEND_URL
Value: https://schedule-onus.vercel.app
Environment: Production, Preview, Development
```

#### 5. NODE_ENV
```
Key: NODE_ENV
Value: production
Environment: Production
```

#### 6. VERCEL
```
Key: VERCEL
Value: 1
Environment: Production, Preview, Development
```

---

### Bước 3: Redeploy

Sau khi thêm environment variables:
1. Vào tab **Deployments**
2. Click vào deployment mới nhất
3. Click **⋯** (3 dots) → **Redeploy**
4. Chọn **Use existing Build Cache** (nếu muốn nhanh)
5. Click **Redeploy**

---

## 🧪 Test sau khi deploy

### Test 1: Health Check
```bash
curl https://schedule-onus.vercel.app/api/auth/login
```

Nếu trả về lỗi validation (400) thay vì 500 → Thành công!

### Test 2: Login
```bash
curl -X POST https://schedule-onus.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"admin","password":"admin123"}'
```

Nếu trả về token → Thành công hoàn toàn!

---

## 🔍 Debug nếu vẫn lỗi

### Xem Logs trên Vercel
1. Vào project → **Deployments**
2. Click vào deployment mới nhất
3. Click **View Function Logs**
4. Tìm lỗi trong logs

### Các lỗi thường gặp:

#### Lỗi: "MongooseServerSelectionError"
- ✅ Kiểm tra MONGODB_URI đúng chưa
- ✅ Kiểm tra MongoDB Atlas có cho phép IP của Vercel chưa
  - Vào MongoDB Atlas → Network Access
  - Add IP: `0.0.0.0/0` (allow all) hoặc IP của Vercel

#### Lỗi: "jwt must be provided"
- ✅ Kiểm tra JWT_SECRET đã được set chưa

#### Lỗi: "Cannot find module"
- ✅ Kiểm tra `installCommand` trong vercel.json
- ✅ Đảm bảo dependencies được cài đặt đúng

---

## 📝 Checklist

- [ ] Đã thêm MONGODB_URI
- [ ] Đã thêm JWT_SECRET
- [ ] Đã thêm JWT_EXPIRES_IN
- [ ] Đã thêm FRONTEND_URL
- [ ] Đã thêm NODE_ENV=production
- [ ] Đã thêm VERCEL=1
- [ ] Đã cho phép IP của Vercel trên MongoDB Atlas (0.0.0.0/0)
- [ ] Đã redeploy sau khi thêm env vars
- [ ] Đã test API login thành công

---

## 🎯 Kết quả mong đợi

Sau khi setup đúng, API sẽ trả về:

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

Thay vì lỗi 500!
