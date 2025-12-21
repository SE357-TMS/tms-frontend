# Booking Management - Quản lý Phiếu Đặt Tour

## Tổng quan

Module quản lý phiếu đặt tour (Bookings) cho phép STAFF và ADMIN thực hiện các chức năng quản lý đặt tour.

## Use Cases đã triển khai

| #   | Tên chức năng                    | Mô tả                                             | Trạng thái    |
| --- | -------------------------------- | ------------------------------------------------- | ------------- |
| 39  | Thêm phiếu đặt mới               | Tạo phiếu đặt tour mới cho khách hàng             | ✅ Hoàn thành |
| 40  | Xem chi tiết đơn hàng            | Xem thông tin chi tiết phiếu đặt                  | ✅ Hoàn thành |
| 41  | Sửa phiếu đặt (chưa đến ngày đi) | Chỉnh sửa thông tin phiếu đặt trước khi khởi hành | ✅ Hoàn thành |
| 42  | Hủy đơn hàng                     | Hủy phiếu đặt tour                                | ✅ Hoàn thành |
| 43  | Tìm kiếm đơn hàng                | Tìm kiếm và lọc danh sách phiếu đặt               | ✅ Hoàn thành |
| 44  | Xem thông tin hóa đơn            | Xem hóa đơn của phiếu đặt                         | ✅ Hoàn thành |

## Cấu trúc file

```
src/pages/BookingsPage/
├── index.jsx              # Trang chính hiển thị danh sách bookings
├── BookingsPage.css       # Styles cho trang chính
├── BookingAddModal.jsx    # Modal thêm phiếu đặt mới
├── BookingDetailModal.jsx # Modal xem chi tiết phiếu đặt
├── BookingEditModal.jsx   # Modal chỉnh sửa phiếu đặt
├── BookingModal.css       # Styles chung cho các modal
└── README.md              # Tài liệu hướng dẫn
```

## API Endpoints sử dụng

### Tour Bookings API (`/api/v1/tour-bookings`)

| Method | Endpoint                            | Mô tả                                   | Quyền         |
| ------ | ----------------------------------- | --------------------------------------- | ------------- |
| GET    | `/api/v1/tour-bookings`             | Lấy danh sách phiếu đặt (có phân trang) | ADMIN, STAFF  |
| GET    | `/api/v1/tour-bookings/{id}`        | Lấy chi tiết phiếu đặt                  | Authenticated |
| POST   | `/api/v1/tour-bookings`             | Tạo phiếu đặt mới                       | Authenticated |
| PUT    | `/api/v1/tour-bookings/{id}`        | Cập nhật trạng thái phiếu đặt           | ADMIN, STAFF  |
| POST   | `/api/v1/tour-bookings/{id}/cancel` | Hủy phiếu đặt                           | Authenticated |

### Invoice API (`/api/v1/invoices`)

| Method | Endpoint                               | Mô tả                    | Quyền         |
| ------ | -------------------------------------- | ------------------------ | ------------- |
| GET    | `/api/v1/invoices/booking/{bookingId}` | Lấy hóa đơn theo booking | Authenticated |

### Trips API (`/api/v1/trips`)

| Method | Endpoint            | Mô tả                                   | Quyền  |
| ------ | ------------------- | --------------------------------------- | ------ |
| GET    | `/api/v1/trips/all` | Lấy tất cả chuyến đi (không phân trang) | Public |

### Users API (`/admin/users`)

| Method | Endpoint                     | Mô tả                    | Quyền        |
| ------ | ---------------------------- | ------------------------ | ------------ |
| GET    | `/admin/users?role=CUSTOMER` | Lấy danh sách khách hàng | ADMIN, STAFF |

## Tính năng chi tiết

### 1. Danh sách phiếu đặt (BookingsPage)

- Hiển thị danh sách phiếu đặt với phân trang
- Tìm kiếm theo tên khách hàng, email, tên tour
- Lọc theo trạng thái (Chờ xác nhận, Đã xác nhận, Đã hủy, Hoàn thành)
- Xem, chỉnh sửa, hủy phiếu đặt trực tiếp từ bảng

### 2. Thêm phiếu đặt mới (BookingAddModal)

- Chọn chuyến đi từ danh sách trips đang mở
- Chọn khách hàng từ dropdown
- Thêm số lượng hành khách (1-10)
- Nhập thông tin từng hành khách:
  - Họ tên
  - Giới tính
  - Ngày sinh
  - CMND/CCCD
- Có thể chọn hành khách từ danh sách khách hàng đã có

### 3. Xem chi tiết (BookingDetailModal)

- Thông tin chuyến đi (tên tour, ngày đi, ngày về, tổng tiền)
- Thông tin khách hàng đặt
- Danh sách hành khách
- Thông tin hóa đơn (nếu có)
- Nút xem hóa đơn chi tiết
- Nút chỉnh sửa (nếu chưa đến ngày khởi hành)

### 4. Chỉnh sửa phiếu đặt (BookingEditModal)

- Cập nhật trạng thái phiếu đặt
- Chỉnh sửa thông tin hành khách
- Chỉ cho phép chỉnh sửa nếu:
  - Chưa đến ngày khởi hành
  - Trạng thái chưa phải CANCELLED hoặc COMPLETED

### 5. Hủy phiếu đặt

- Xác nhận trước khi hủy
- Gọi API cancel booking
- Cập nhật lại danh sách sau khi hủy

## Trạng thái phiếu đặt

| Status    | Mô tả (Tiếng Việt) | Màu        |
| --------- | ------------------ | ---------- |
| PENDING   | Chờ xác nhận       | Vàng       |
| CONFIRMED | Đã xác nhận        | Xanh lá    |
| CANCELLED | Đã hủy             | Đỏ         |
| COMPLETED | Hoàn thành         | Xanh dương |

## Hướng dẫn sử dụng

### Thêm phiếu đặt mới

1. Click nút "Thêm phiếu đặt mới"
2. Chọn chuyến đi từ dropdown
3. Chọn khách hàng đặt tour
4. Điều chỉnh số lượng hành khách
5. Nhập thông tin từng hành khách hoặc chọn từ danh sách
6. Click "Xác nhận" để tạo phiếu đặt

### Xem/Chỉnh sửa phiếu đặt

1. Click icon "Xem" (👁) để xem chi tiết
2. Trong modal chi tiết, click "Chỉnh sửa" (nếu có thể)
3. Thay đổi thông tin cần thiết
4. Click "Lưu thay đổi"

### Hủy phiếu đặt

1. Click icon "X" (Hủy) trên dòng phiếu đặt
2. Xác nhận hủy trong popup
3. Phiếu đặt sẽ chuyển sang trạng thái "Đã hủy"

## Lưu ý kỹ thuật

- Sử dụng `api` từ `lib/httpHandler.js` để gọi API
- Sử dụng `SweetAlert2` cho thông báo
- CSS theo design system có sẵn (variables trong `:root`)
- Modal sử dụng portal pattern với overlay
- Form validation trước khi submit

## Dependencies

- `sweetalert2`: Thông báo và confirm dialog
- `axios`: HTTP client (qua httpHandler)
- `react-router-dom`: Routing

## Phát triển tiếp

Các tính năng có thể mở rộng:

- Export danh sách phiếu đặt ra Excel/PDF
- In hóa đơn
- Gửi email xác nhận
- Thanh toán trực tuyến
- Lịch sử thay đổi phiếu đặt
