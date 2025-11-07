# 🔍 Debug Auto-Login Issue

## Các bước kiểm tra:

### 1. Mở Browser Console (F12)

Vào `http://localhost:3000` và xem Console logs:

```
[Auto-login] No token found, attempting auto-login...
[Auto-login] API URL: http://localhost:8081
[Auto-login] Username: admin
```

Nếu thấy lỗi CORS:

```
Access to fetch at 'http://localhost:8081/auth/login' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

→ Backend chưa config CORS!

### 2. Test API trực tiếp

Mở: `http://localhost:3000/test-api.html`
Click "Test Login"

- ✅ Nếu hiển thị token → API OK, vấn đề là CORS
- ❌ Nếu lỗi → Backend chưa chạy hoặc credentials sai

### 3. Kiểm tra Backend CORS Config

Backend phải có file `WebConfig.java`:

```java
package com.example.tms.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:5173"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**HOẶC** thêm annotation vào `AuthController.java`:

```java
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {
    // ... existing code
}
```

### 4. Kiểm tra User trong Database

```sql
-- Kiểm tra user admin có tồn tại không
SELECT * FROM users WHERE username = 'admin';

-- Nếu không có, tạo mới:
INSERT INTO users (id, username, password, email, full_name, phone_number, role, created_at)
VALUES (
  UUID(),
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- BCrypt của 'admin123'
  'admin@tms.com',
  'Administrator',
  '0123456789',
  'ADMIN',
  NOW()
);
```

### 5. Restart Backend sau khi config CORS

```bash
# Stop backend (Ctrl+C)
# Start lại
cd backend
./mvnw spring-boot:run
```

### 6. Kiểm tra .env Frontend

```bash
# File: .env
VITE_API_BASE_URL=http://localhost:8081
VITE_DEFAULT_USERNAME=admin
VITE_DEFAULT_PASSWORD=admin123
```

### 7. Clear Browser Cache & Restart Frontend

```bash
# Stop frontend (Ctrl+C)
npm run dev
```

Rồi refresh browser với **Ctrl+Shift+R** (hard refresh)

---

## 🎯 Lỗi phổ biến:

### Lỗi: "CORS policy"

**Nguyên nhân:** Backend chưa cho phép origin `http://localhost:3000`

**Fix:** Thêm CORS config trong Spring Boot (bước 3)

### Lỗi: "401 Unauthorized"

**Nguyên nhân:** Username/Password sai hoặc user không tồn tại

**Fix:**

- Check database có user admin chưa
- Verify password đã hash đúng chưa
- Check credentials trong .env

### Lỗi: "Network Error" hoặc "ERR_CONNECTION_REFUSED"

**Nguyên nhân:** Backend chưa chạy

**Fix:** Start backend ở port 8081

### Lỗi: "Cannot read property 'token'"

**Nguyên nhân:** Response format không đúng

**Fix:** Backend phải trả về `{ token: "...", refreshToken: "..." }`

---

## ✅ Checklist hoàn chỉnh:

- [ ] Backend đang chạy ở `http://localhost:8081`
- [ ] CORS đã config trong backend
- [ ] User `admin/admin123` có trong database
- [ ] File `.env` tồn tại với đúng config
- [ ] Frontend đang chạy ở `http://localhost:3000`
- [ ] Browser console không có lỗi CORS
- [ ] Test API file (`/test-api.html`) hoạt động

---

Sau khi check hết checklist trên, refresh browser và xem!
