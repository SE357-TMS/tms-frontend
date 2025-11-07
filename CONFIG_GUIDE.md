# 🔧 Configuration Management

## 📍 Tập trung Config ở 1 chỗ

Tất cả config được quản lý trong file: **`src/config/constants.js`**

### ⚙️ Thay đổi Port Backend

#### Cách 1: Sửa trong `.env` (Khuyến nghị)

```bash
# File: .env
VITE_API_BASE_URL=http://localhost:8081  # Port hiện tại

# Thay đổi thành:
VITE_API_BASE_URL=http://localhost:8080  # Port mới
```

**Sau khi sửa:**

```bash
# Restart dev server
npm run dev
```

#### Cách 2: Sửa trong `constants.js`

```javascript
// File: src/config/constants.js
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

// Thay đổi default value:
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
```

### 📦 Cấu trúc Constants

```javascript
// src/config/constants.js

// 1. API Base URL - Chỉ cần sửa 1 chỗ này
export const API_BASE_URL = "http://localhost:8081";

// 2. API Endpoints - Tự động kết hợp với base URL
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login", // → http://localhost:8081/auth/login
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    BASE: "/admin/users", // → http://localhost:8081/admin/users
    BY_ID: (id) => `/admin/users/${id}`,
  },
};

// 3. Auth Config
export const AUTH_CONFIG = {
  DEFAULT_USERNAME: "admin",
  DEFAULT_PASSWORD: "admin123",
  TOKEN_KEY: "accessToken",
  REFRESH_TOKEN_KEY: "refreshToken",
};
```

### 🔄 Các file sử dụng constants

| File                      | Import                                     | Sử dụng               |
| ------------------------- | ------------------------------------------ | --------------------- |
| `services/api.js`         | `API_BASE_URL, API_CONFIG, AUTH_CONFIG`    | Axios instance config |
| `services/authService.js` | `API_BASE_URL, API_ENDPOINTS, AUTH_CONFIG` | Auth API calls        |
| `services/userService.js` | `API_ENDPOINTS`                            | User API calls        |

### ✅ Lợi ích

1. **Thay đổi port:** Chỉ sửa 1 chỗ (`.env` hoặc `constants.js`)
2. **Dễ maintain:** Tất cả config ở 1 file
3. **Tránh hardcode:** Không có URL rải rác trong code
4. **Dễ test:** Dễ dàng switch giữa các môi trường

### 🌍 Các môi trường khác nhau

#### Development:

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8081
VITE_DEFAULT_USERNAME=admin
VITE_DEFAULT_PASSWORD=admin123
```

#### Production:

```bash
# .env.production
VITE_API_BASE_URL=https://api.tms.com
# Không set default credentials trong production
```

#### Staging:

```bash
# .env.staging
VITE_API_BASE_URL=https://staging-api.tms.com
```

### 🚀 Sử dụng trong code

```javascript
// ❌ KHÔNG NÊN - Hardcode URL
const response = await axios.get("http://localhost:8081/admin/users");

// ✅ NÊN - Dùng constants
import { API_BASE_URL, API_ENDPOINTS } from "@/config/constants";
const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.USERS.BASE}`);

// ✅ HOẶC - Dùng api service (tự động có base URL)
import api from "@/services/api";
const response = await api.get(API_ENDPOINTS.USERS.BASE);
```

### 📝 Thêm endpoint mới

```javascript
// src/config/constants.js

export const API_ENDPOINTS = {
  // ... existing endpoints

  // Thêm mới
  TRAVELS: {
    BASE: "/travels",
    BY_ID: (id) => `/travels/${id}`,
    BY_USER: (userId) => `/users/${userId}/travels`,
  },

  BOOKINGS: {
    BASE: "/bookings",
    BY_ID: (id) => `/bookings/${id}`,
    CONFIRM: (id) => `/bookings/${id}/confirm`,
  },
};
```

### 🔐 Thay đổi credentials mặc định

```javascript
// src/config/constants.js

export const AUTH_CONFIG = {
  DEFAULT_USERNAME: "testuser", // Thay đổi
  DEFAULT_PASSWORD: "test123", // Thay đổi
  // ...
};
```

Hoặc trong `.env`:

```bash
VITE_DEFAULT_USERNAME=testuser
VITE_DEFAULT_PASSWORD=test123
```

### 🎯 Quick Reference

| Muốn thay đổi    | File           | Location                |
| ---------------- | -------------- | ----------------------- |
| Port backend     | `.env`         | `VITE_API_BASE_URL`     |
| Default username | `.env`         | `VITE_DEFAULT_USERNAME` |
| Default password | `.env`         | `VITE_DEFAULT_PASSWORD` |
| Timeout          | `constants.js` | `API_CONFIG.TIMEOUT`    |
| Token keys       | `constants.js` | `AUTH_CONFIG.*_KEY`     |

---

**✨ Bây giờ chỉ cần sửa 1 chỗ, toàn bộ app tự động update!**
