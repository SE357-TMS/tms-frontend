# Cấu trúc dự án TMS (Travel Management System) Frontend

## 📁 Cấu trúc thư mục

```
tms-frontend/
├── src/
│   ├── assets/              # Tài nguyên tĩnh (images, fonts, icons)
│   ├── components/          # Các React components
│   │   ├── common/          # Components dùng chung (Button, Input, Card...)
│   │   └── layout/          # Layout components (Header, Footer, Sidebar...)
│   ├── contexts/            # React Context cho state management
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Các trang của ứng dụng
│   ├── routes/              # Cấu hình routing
│   ├── services/            # API services (axios calls)
│   ├── styles/              # Global styles
│   ├── utils/               # Utility functions và helpers
│   ├── constants/           # Constants và config
│   ├── App.jsx              # Root component
│   └── main.jsx             # Entry point
├── public/                  # Static files
├── .env.example             # Environment variables template
└── package.json
```

## 📝 Mô tả chi tiết

### 1. **components/**

Chứa tất cả các React components được tổ chức theo mục đích:

- `common/`: Components tái sử dụng (Button, Input, Modal, Card...)
- `layout/`: Components layout (Header, Footer, Sidebar...)

### 2. **pages/**

Mỗi page đại diện cho một route/màn hình trong ứng dụng:

- `HomePage.jsx`
- `LoginPage.jsx`
- `TravelsPage.jsx`
- ...

### 3. **services/**

Xử lý tất cả API calls:

- `api.js`: Cấu hình axios instance
- `authService.js`: API liên quan đến authentication
- `travelService.js`: API liên quan đến travels/tours
- ...

### 4. **contexts/**

React Context cho state management toàn cục:

- `AuthContext.jsx`: Quản lý authentication state
- ...

### 5. **hooks/**

Custom React hooks:

- `useTravels.js`: Hook để quản lý travels/tours
- `useAuth.js`: Hook để sử dụng auth context
- ...

### 6. **utils/**

Utility functions và helper functions:

- `helpers.js`: Các hàm tiện ích (formatDate, validateEmail...)
- ...

### 7. **constants/**

Định nghĩa các constants:

- Travel status (trạng thái tour)
- Travel types (loại hình du lịch)
- Routes
- ...

## 🚀 Cách sử dụng

### Cài đặt dependencies

```bash
npm install
```

### Tạo file .env

```bash
cp .env.example .env
```

### Chạy development server

```bash
npm run dev
```

### Build production

```bash
npm run build
```

## 📦 Packages đã cài đặt

- React + Vite
- Axios (HTTP client)

## 🎯 Best Practices

1. **Components**: Tạo components nhỏ, tái sử dụng được
2. **Naming**: Sử dụng PascalCase cho components, camelCase cho functions
3. **File organization**: Mỗi component có thể có file CSS riêng
4. **State management**: Sử dụng Context cho global state, useState/useReducer cho local state
5. **API calls**: Tất cả API calls đều qua services layer
6. **Error handling**: Luôn xử lý errors trong try-catch

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)
