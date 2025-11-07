# Users Management Page

Trang quản lý người dùng (Users) cho Tourism Management System.

## Tính năng

### 1. Hiển thị danh sách Users

- Hiển thị tất cả users dưới dạng bảng
- Các cột: Username, Email, Full Name, Phone Number, Role, Created At
- Badge màu sắc cho từng role:
  - **ADMIN**: Đỏ (red badge)
  - **STAFF**: Xanh dương (blue badge)
  - **USER**: Xanh lá (green badge)

### 2. Tìm kiếm Users

- Search box cho phép tìm kiếm theo:
  - Username
  - Email
  - Full Name
  - Role

### 3. Thêm User mới (Create)

- Click nút "Add New User"
- Form nhập liệu:
  - Username (required)
  - Email (required, phải hợp lệ)
  - Password (required khi tạo mới)
  - Full Name (required)
  - Phone Number
  - Role (dropdown: USER, STAFF, ADMIN)
- Validation form
- Gọi API: `POST /admin/users`

### 4. Xem/Chỉnh sửa User (View/Edit)

- Click icon 👁️ ở cột View
- Hiển thị modal với thông tin user
- Cho phép chỉnh sửa:
  - Email
  - Full Name
  - Phone Number
  - Role
- Username không thể chỉnh sửa
- Gọi API: `PUT /admin/users/{id}`

### 5. Xóa User (Delete)

- Click icon 🗑️ ở cột Delete
- Hiển thị confirm dialog
- Gọi API: `DELETE /admin/users/{id}`

## API Integration

### Kết nối với Backend

Để kết nối với API thực tế, mở file `src/pages/UsersPage/index.jsx` và uncomment các dòng API call:

```javascript
// Trong fetchUsers()
const data = await userService.getAllUsers();
setUsers(data);

// Trong handleSubmit()
await userService.createUser(formData);
// hoặc
await userService.updateUser(selectedUser.id, formData);

// Trong handleDeleteUser()
await userService.deleteUser(userId);
```

### Cấu hình API Base URL

Chỉnh sửa file `src/services/api.js`:

```javascript
const API_BASE_URL = "http://localhost:8080"; // Thay đổi theo URL backend
```

### Authentication

API yêu cầu JWT token trong header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

Token được lấy từ localStorage sau khi login thành công.

## Cấu trúc Files

```
src/pages/UsersPage/
├── index.jsx          # Component chính
└── UsersPage.css      # Styles

src/services/
└── userService.js     # Service gọi API users
```

## API Endpoints

### 1. Get All Users

```
GET /admin/users
Authorization: Bearer {token}
Response: Array<UserResponse>
```

### 2. Get User By ID

```
GET /admin/users/{id}
Authorization: Bearer {token}
Response: UserResponse
```

### 3. Create User

```
POST /admin/users
Authorization: Bearer {token}
Body: {
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "USER|STAFF|ADMIN"
}
Response: UserResponse
```

### 4. Update User

```
PUT /admin/users/{id}
Authorization: Bearer {token}
Body: {
  "email": "string",
  "fullName": "string",
  "phoneNumber": "string",
  "role": "USER|STAFF|ADMIN"
}
Response: UserResponse
```

### 5. Delete User

```
DELETE /admin/users/{id}
Authorization: Bearer {token}
Response: 204 No Content
```

### 6. Get Users By Role

```
GET /admin/users/role/{role}
Authorization: Bearer {token}
Response: Array<UserResponse>
```

## Response Types

### UserResponse

```typescript
{
  id: string (UUID),
  username: string,
  email: string,
  fullName: string,
  phoneNumber: string,
  role: "USER" | "STAFF" | "ADMIN",
  createdAt: string (ISO date)
}
```

## Permissions

Trang này yêu cầu quyền: `ADMIN` hoặc `STAFF`

```java
@PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
```

## Routing

Truy cập trang Users tại: `/users`

Đã được thêm vào Sidebar menu với icon 👤

## Testing

### Mock Data

Hiện tại sử dụng mock data để test giao diện:

- 3 users mẫu (ADMIN, STAFF, USER)
- Tất cả chức năng UI hoạt động

### Production

Khi deploy production, uncomment các API calls và đảm bảo:

1. Backend API đã chạy
2. CORS được cấu hình đúng
3. JWT token được lưu và gửi kèm request

## Screenshots

Giao diện tương tự như Routes page với:

- Header có search và profile
- Table hiển thị users
- Modal form để thêm/sửa
- Action buttons (View/Delete)
- Pagination ở dưới table

## Responsive Design

- Desktop: Full layout với sidebar
- Tablet: Table scroll horizontal
- Mobile: Stack layout, modal full screen
