# Hướng dẫn cấu hình API và Auto-Login

## 🚀 Tổng quan

Frontend đã được cấu hình để:

1. **Auto-login** khi load app lần đầu
2. **Tự động refresh token** khi access token hết hạn
3. **Gọi API trực tiếp** từ backend Spring Boot

## 📋 Các thay đổi

### 1. API Service (`src/services/api.js`)

#### Đã cập nhật:

- ✅ Base URL: `http://localhost:8080` (không có `/api`)
- ✅ Interceptor để thêm `Bearer {accessToken}` vào header
- ✅ Auto refresh token khi gặp lỗi 401
- ✅ Queue system để tránh gọi refresh nhiều lần
- ✅ Redirect về `/login` khi refresh token hết hạn

#### Cách hoạt động:

```javascript
// Request flow:
1. Gửi request với accessToken trong header
2. Nếu 401 → Gọi /auth/refresh với refreshToken
3. Nhận accessToken mới và refreshToken cũ
4. Retry request ban đầu
5. Nếu refresh fail → Clear localStorage và redirect login
```

### 2. Auth Service (`src/services/authService.js`)

#### API Methods:

**Login:**

```javascript
POST / auth / login;
Body: {
  username, password;
}
Response: {
  accessToken, refreshToken;
}
```

**Auto Login:**

- Tự động login khi app load
- Credentials từ `.env`:
  - `VITE_DEFAULT_USERNAME` (default: admin)
  - `VITE_DEFAULT_PASSWORD` (default: admin123)

**Refresh Token:**

```javascript
POST / auth / refresh;
Body: {
  refreshToken;
}
Response: {
  accessToken, refreshToken;
}
```

**Logout:**

```javascript
POST /auth/logout
Headers: { Authorization: Bearer {accessToken} }
Body: { refreshToken }
```

### 3. Auto Login Hook (`src/hooks/useAutoLogin.js`)

Tự động gọi login khi app load:

- Kiểm tra có `accessToken` chưa
- Nếu chưa → Gọi `authService.autoLogin()`
- Lưu tokens vào localStorage

### 4. App Component (`src/App.jsx`)

Hiển thị loading screen khi auto-login:

- ⏳ "Đang đăng nhập..." - Khi đang login
- ✅ Load app bình thường - Khi login thành công
- ❌ Hiển thị lỗi - Khi login thất bại

### 5. Users Page (`src/pages/UsersPage/index.jsx`)

Đã uncomment tất cả API calls:

- ✅ `fetchUsers()` → `GET /admin/users`
- ✅ `handleSubmit()` → `POST /admin/users` hoặc `PUT /admin/users/{id}`
- ✅ `handleDeleteUser()` → `DELETE /admin/users/{id}`

## ⚙️ Cấu hình

### 1. Tạo file `.env`:

```bash
# Copy từ .env.example
cp .env.example .env
```

### 2. Chỉnh sửa `.env`:

```bash
# Backend URL
VITE_API_BASE_URL=http://localhost:8080

# Auto-login credentials (phải match với DB)
VITE_DEFAULT_USERNAME=admin
VITE_DEFAULT_PASSWORD=admin123
```

### 3. Backend phải có sẵn user:

```sql
-- User mặc định trong database
INSERT INTO users (username, password, role)
VALUES ('admin', '{bcrypt_hash}', 'ADMIN');
```

## 🔧 LocalStorage

App sử dụng localStorage để lưu:

```javascript
{
  "accessToken": "eyJhbGc...",   // JWT access token (15 phút)
  "refreshToken": "uuid-string"  // Refresh token (7 ngày)
}
```

## 🔄 Flow hoàn chỉnh

### Khi app load lần đầu:

```
1. App.jsx render
   ↓
2. useAutoLogin hook check localStorage
   ↓
3. Không có token → Gọi authService.autoLogin()
   ↓
4. POST /auth/login với credentials mặc định
   ↓
5. Nhận accessToken + refreshToken
   ↓
6. Lưu vào localStorage
   ↓
7. App render bình thường
```

### Khi gọi API users:

```
1. UsersPage gọi userService.getAllUsers()
   ↓
2. api.js interceptor thêm Bearer token
   ↓
3. GET /admin/users với Authorization header
   ↓
4. Backend xác thực token
   ↓
5. Trả về danh sách users
```

### Khi token hết hạn:

```
1. API trả về 401 Unauthorized
   ↓
2. api.js interceptor bắt lỗi
   ↓
3. Gọi POST /auth/refresh
   ↓
4. Nhận accessToken mới
   ↓
5. Lưu vào localStorage
   ↓
6. Retry request ban đầu
```

### Khi refresh token hết hạn:

```
1. API refresh trả về 401
   ↓
2. Clear localStorage
   ↓
3. Redirect về /login
```

## 🧪 Testing

### 1. Start backend:

```bash
cd backend
./mvnw spring-boot:run
```

### 2. Start frontend:

```bash
cd frontend
npm run dev
```

### 3. Mở browser:

```
http://localhost:5173
```

### 4. Kiểm tra:

- ✅ Auto-login thành công
- ✅ Chuyển vào trang Users
- ✅ Hiển thị danh sách users từ API
- ✅ Thêm/sửa/xóa user hoạt động
- ✅ Token tự động refresh khi hết hạn

## 🐛 Troubleshooting

### Lỗi: "Auto-login thất bại"

**Nguyên nhân:**

- Backend chưa chạy
- Credentials sai
- CORS chưa cấu hình

**Giải pháp:**

```bash
# 1. Check backend
curl http://localhost:8080/auth/login

# 2. Check CORS trong backend
@CrossOrigin(origins = "http://localhost:5173")

# 3. Check credentials trong .env
```

### Lỗi: "401 Unauthorized"

**Nguyên nhân:**

- Token hết hạn và refresh fail
- Token không được gửi kèm request

**Giải pháp:**

```javascript
// Check localStorage
console.log(localStorage.getItem("accessToken"));

// Check API interceptor
console.log("Token in request:", config.headers.Authorization);
```

### Lỗi: CORS

**Backend Spring Boot cần cấu hình:**

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 📝 Notes

1. **Auto-login chỉ dùng cho development**, production nên bỏ
2. **Refresh token được giữ nguyên** theo implementation backend
3. **Access token mới được tạo mỗi lần refresh**
4. **Logout sẽ xóa refresh token** khỏi database

## 🔐 Security Notes

- ⚠️ Không commit file `.env` vào git
- ⚠️ Production nên dùng HTTPS
- ⚠️ Nên implement CSRF protection
- ⚠️ Refresh token nên được lưu trong httpOnly cookie (hiện tại dùng localStorage)
