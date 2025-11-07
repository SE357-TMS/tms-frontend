# 🚀 TMS Frontend - API Integration Complete

## ✅ Đã hoàn thành

### 1. **Axios Configuration với Auto Refresh Token**

- File: `src/services/api.js`
- Base URL: `http://localhost:8080`
- Request interceptor: Tự động thêm `Bearer {accessToken}`
- Response interceptor: Tự động refresh token khi 401
- Queue system: Tránh gọi refresh nhiều lần đồng thời

### 2. **Auth Service với Auto Login**

- File: `src/services/authService.js`
- `login()`: Gọi API `/auth/login`
- `autoLogin()`: Tự động login với credentials từ `.env`
- `refreshToken()`: Gọi API `/auth/refresh`
- `logout()`: Gọi API `/auth/logout` và clear localStorage

### 3. **Auto Login Hook**

- File: `src/hooks/useAutoLogin.js`
- Tự động check và login khi app load
- Return `{ isLoading, error }`

### 4. **App Component với Loading Screen**

- File: `src/App.jsx`
- Hiển thị "Đang đăng nhập..." khi auto-login
- Hiển thị lỗi nếu backend chưa chạy
- Load app bình thường sau khi login thành công

### 5. **Users Page với API Integration**

- File: `src/pages/UsersPage/index.jsx`
- ✅ `GET /admin/users` - Lấy danh sách users
- ✅ `POST /admin/users` - Tạo user mới
- ✅ `PUT /admin/users/{id}` - Cập nhật user
- ✅ `DELETE /admin/users/{id}` - Xóa user

### 6. **Environment Configuration**

- File: `.env.example`

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_DEFAULT_USERNAME=admin
VITE_DEFAULT_PASSWORD=admin123
```

## 📂 Cấu trúc Files

```
src/
├── services/
│   ├── api.js                  # Axios config + interceptors
│   ├── authService.js          # Auth API calls
│   └── userService.js          # User API calls
├── hooks/
│   └── useAutoLogin.js         # Auto-login hook
├── pages/
│   └── UsersPage/
│       ├── index.jsx           # Users management page
│       ├── UsersPage.css       # Styling
│       └── README.md           # Usage guide
└── App.jsx                     # Main app với auto-login

.env.example                    # Environment variables template
API_SETUP.md                    # Complete API setup guide
```

## 🔄 Token Flow

### 1. Initial Load

```
App load → useAutoLogin → authService.autoLogin()
   ↓
POST /auth/login { username, password }
   ↓
Response: { accessToken, refreshToken }
   ↓
Save to localStorage → App renders
```

### 2. API Calls

```
userService.getAllUsers()
   ↓
api.js interceptor adds: Authorization: Bearer {accessToken}
   ↓
GET /admin/users
   ↓
Response: User[]
```

### 3. Token Refresh

```
API returns 401
   ↓
api.js interceptor catches error
   ↓
POST /auth/refresh { refreshToken }
   ↓
Response: { accessToken, refreshToken }
   ↓
Save new tokens → Retry original request
```

### 4. Logout

```
User clicks Logout
   ↓
POST /auth/logout
Headers: { Authorization: Bearer {accessToken} }
Body: { refreshToken }
   ↓
Clear localStorage → Redirect /login
```

## 🎯 Để chạy

### Backend (Spring Boot):

```bash
cd backend
./mvnw spring-boot:run
# Server: http://localhost:8080
```

### Frontend (React + Vite):

```bash
cd frontend

# 1. Tạo .env từ .env.example
cp .env.example .env

# 2. Sửa credentials trong .env (match với DB)
VITE_DEFAULT_USERNAME=admin
VITE_DEFAULT_PASSWORD=admin123

# 3. Install dependencies (nếu chưa)
npm install

# 4. Start dev server
npm run dev
# Server: http://localhost:3000
```

### Test:

1. Mở browser: `http://localhost:3000`
2. Sẽ thấy "Đang đăng nhập..."
3. Sau đó vào trang Home
4. Click menu "Users" để test CRUD

## 🔧 LocalStorage Keys

```javascript
{
  "accessToken": "eyJhbGc...",    // JWT (15 phút)
  "refreshToken": "uuid-string"   // UUID (7 ngày)
}
```

## 📡 API Endpoints

### Auth Controller

| Method | Endpoint        | Body                     | Response                        |
| ------ | --------------- | ------------------------ | ------------------------------- |
| POST   | `/auth/login`   | `{ username, password }` | `{ accessToken, refreshToken }` |
| POST   | `/auth/refresh` | `{ refreshToken }`       | `{ accessToken, refreshToken }` |
| POST   | `/auth/logout`  | `{ refreshToken }`       | `204 No Content`                |

### User Controller (Requires Auth)

| Method | Endpoint                   | Body          | Response         |
| ------ | -------------------------- | ------------- | ---------------- |
| GET    | `/admin/users`             | -             | `User[]`         |
| GET    | `/admin/users/{id}`        | -             | `User`           |
| POST   | `/admin/users`             | `UserRequest` | `User`           |
| PUT    | `/admin/users/{id}`        | `UserRequest` | `User`           |
| DELETE | `/admin/users/{id}`        | -             | `204 No Content` |
| GET    | `/admin/users/role/{role}` | -             | `User[]`         |

## 🛠️ Troubleshooting

### ❌ "Auto-login thất bại"

**Check:**

1. Backend đã chạy chưa? `curl http://localhost:8080/auth/login`
2. Credentials trong `.env` đúng chưa?
3. CORS đã config chưa?

### ❌ "401 Unauthorized"

**Check:**

1. Token có trong localStorage? `localStorage.getItem('accessToken')`
2. Token có được gửi kèm? Check Network tab → Headers

### ❌ CORS Error

**Backend cần:**

```java
@CrossOrigin(origins = "http://localhost:3000")
// hoặc
@Configuration
public class WebConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("*")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

## 📚 Documentation

- **API Setup Guide**: `API_SETUP.md` - Chi tiết về cấu hình API
- **Users Page Guide**: `src/pages/UsersPage/README.md` - Hướng dẫn trang Users

## 🔐 Security Notes

⚠️ **Development only:**

- Auto-login chỉ dùng cho dev
- Credentials trong `.env` không commit lên git
- Production cần:
  - Disable auto-login
  - HTTPS
  - HttpOnly cookies cho refresh token
  - CSRF protection

## 🎉 Features

✅ Auto-login khi app load  
✅ Auto refresh token khi hết hạn  
✅ Token management trong localStorage  
✅ Error handling và retry logic  
✅ Queue system cho concurrent requests  
✅ Loading states  
✅ Error messages  
✅ Logout và cleanup  
✅ Full CRUD cho Users

## 👨‍💻 Next Steps

1. Test với backend thật
2. Implement error toast thay vì alert()
3. Add loading spinners
4. Implement proper login page
5. Add role-based UI (hide actions cho non-admin)
6. Add pagination cho Users table
7. Add filter by role
8. Improve error messages

---

**Ready to go! 🚀**

Để test ngay: `npm run dev` và mở `http://localhost:3000`
