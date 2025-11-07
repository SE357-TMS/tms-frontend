# Staff Management Page

Trang quản lý nhân viên với đầy đủ chức năng CRUD (Create, Read, Update, Delete/Lock).

## Features

### 1. **Staff List View** (`/staff`)
- Hiển thị danh sách tất cả nhân viên dạng table
- Các cột: Avatar, Name, Gender, Phone, Email, Status, View
- Pagination với navigation buttons
- Search theo keyword (username, name, email)
- Filter theo Gender và Lock Status (chưa implement UI)

### 2. **Staff Detail Modal**
- Xem chi tiết thông tin nhân viên
- Hiển thị: Avatar, Full Name, Gender, Birthday, Address, Phone, Email, Status
- Actions:
  - Edit: Chuyển sang Edit Modal
  - Lock/Unlock: Toggle trạng thái khóa tài khoản

### 3. **Staff Edit Modal**
- Chỉnh sửa thông tin nhân viên
- Form fields:
  - Full Name (required)
  - Gender (M/F/O)
  - Birthday (date picker)
  - Address
  - Phone Number (required, validated)
  - Email (required, validated)
- Validation: Phone number format, email format
- Actions: Cancel, Confirm

### 4. **Staff Add Modal**
- Thêm nhân viên mới
- Upload avatar (preview)
- Account Information:
  - Username (required, min 3 chars)
  - Password (required, min 6 chars)
- Personal Information:
  - Full Name (required)
  - Gender (M/F/O)
  - Birthday
  - Address
  - Phone Number (required, validated)
  - Email (required, validated)
- Backend sẽ tự động gửi welcome email
- Actions: Cancel, Confirm

## API Endpoints

```javascript
GET    /admin/staffs              // Get staff list with pagination & filters
GET    /admin/staffs/{staffId}    // Get staff details
POST   /admin/staffs              // Add new staff
PUT    /admin/staffs/{staffId}    // Update staff
PATCH  /admin/staffs/{staffId}/toggle-lock  // Lock/Unlock staff
DELETE /admin/staffs/{staffId}    // Delete staff permanently (chưa dùng)
```

## Files Structure

```
StaffPage/
├── index.jsx              // Main page component
├── StaffPage.css          // Main page styles
├── StaffDetailModal.jsx   // View staff details
├── StaffEditModal.jsx     // Edit staff form
├── StaffAddModal.jsx      // Add new staff form
├── StaffModal.css         // Shared modal styles
└── README.md              // This file
```

## Design Reference

- Figma: [Staff Management Design](https://www.figma.com/design/05mTki1gLKqeb2wqX67P5f/Tourism-Management-System?node-id=130-1738)
- Color scheme: Sử dụng globals.css variables
- Primary color: `#4D40CA`
- Avatar gradient: `#6FC6A1` → `#4D40CA`

## Usage

```jsx
import StaffPage from './pages/StaffPage';

// In router
{
  path: '/staff',
  element: <StaffPage />,
}
```

## TODO

- [ ] Implement filter UI (Gender dropdown, Status toggle)
- [ ] Add delete confirmation modal
- [ ] Implement avatar upload to backend
- [ ] Add loading states for modals
- [ ] Add success/error toast notifications
- [ ] Implement sort by columns
- [ ] Add export to CSV/Excel
- [ ] Add bulk actions (lock/unlock multiple)
