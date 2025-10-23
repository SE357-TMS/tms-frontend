# Hướng dẫn React Router

## 🎯 Đã setup hoàn chỉnh

React Router đã được cấu hình với các tính năng:

- ✅ Protected Routes (yêu cầu đăng nhập)
- ✅ Public Routes (chỉ khi chưa đăng nhập)
- ✅ Navigation guards
- ✅ 404 Page

## 📁 Cấu trúc Routes

```
src/routes/
├── index.jsx           # Export AppRouter component
├── router.js           # Định nghĩa routes
├── ProtectedRoute.jsx  # Route yêu cầu authentication
└── PublicRoute.jsx     # Route chỉ cho phép khi chưa đăng nhập
```

## 🛣️ Danh sách Routes

### Public Routes (không cần đăng nhập)

- `/` - Trang chủ
- `/login` - Đăng nhập
- `/register` - Đăng ký

### Protected Routes (cần đăng nhập)

- `/dashboard` - Dashboard
- `/travels` - Danh sách tour (dùng custom hook)
- `/travels-query` - Danh sách tour (dùng React Query)
- `/travels/:id` - Chi tiết tour

### Special Routes

- `*` - 404 Not Found

## 💡 Cách sử dụng

### 1. Navigation trong Component

```jsx
import { useNavigate, Link } from "react-router-dom";

function MyComponent() {
  const navigate = useNavigate();

  // Sử dụng Link
  return (
    <div>
      <Link to="/travels">Danh sách tour</Link>
      <Link to="/travels/123">Chi tiết tour 123</Link>
    </div>
  );

  // Hoặc sử dụng navigate programmatically
  const handleClick = () => {
    navigate("/travels");
    // navigate(-1); // Quay lại
    // navigate('/login', { replace: true }); // Thay thế history
  };
}
```

### 2. Lấy URL Parameters

```jsx
import { useParams } from "react-router-dom";

function TravelDetailPage() {
  const { id } = useParams(); // Lấy :id từ URL
  console.log(id); // "123" nếu URL là /travels/123
}
```

### 3. Lấy Query Strings

```jsx
import { useSearchParams } from "react-router-dom";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q"); // ?q=keyword
  const page = searchParams.get("page"); // ?page=2

  // Cập nhật query string
  setSearchParams({ q: "new keyword", page: 3 });
}
```

### 4. Protected Route (tự động)

Các routes trong `ProtectedRoute` sẽ tự động:

- ✅ Kiểm tra authentication
- ✅ Redirect về `/login` nếu chưa đăng nhập
- ✅ Hiển thị loading state

```jsx
// routes/router.js
{
  path: '/travels',
  element: (
    <ProtectedRoute>
      <TravelsPage />
    </ProtectedRoute>
  ),
}
```

### 5. Public Route (tự động)

Các routes trong `PublicRoute` sẽ tự động:

- ✅ Redirect về `/dashboard` nếu đã đăng nhập
- ✅ Chỉ cho phép truy cập khi chưa đăng nhập

```jsx
{
  path: '/login',
  element: (
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  ),
}
```

## 🎨 Thêm Route mới

### Bước 1: Tạo Page Component

```jsx
// src/pages/MyNewPage.jsx
import Layout from "../components/layout/Layout";

const MyNewPage = () => {
  return (
    <Layout>
      <h1>My New Page</h1>
    </Layout>
  );
};

export default MyNewPage;
```

### Bước 2: Thêm vào router.js

```jsx
// src/routes/router.js
import MyNewPage from "../pages/MyNewPage";

export const router = createBrowserRouter([
  // ... existing routes
  {
    path: "/my-new-page",
    element: (
      <ProtectedRoute>
        <MyNewPage />
      </ProtectedRoute>
    ),
  },
]);
```

### Bước 3: Thêm link trong Header

```jsx
// src/components/layout/Header.jsx
<Link to="/my-new-page" className="nav-link">
  My Page
</Link>
```

## 🔐 Authentication Flow

1. User chưa đăng nhập truy cập `/travels`
2. `ProtectedRoute` kiểm tra `isAuthenticated`
3. Redirect về `/login`
4. User đăng nhập thành công
5. Redirect về `/dashboard` hoặc trang được yêu cầu

## 📚 Tài liệu tham khảo

- [React Router Docs](https://reactrouter.com)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
