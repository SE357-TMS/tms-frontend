# Hướng dẫn sử dụng React Query (TanStack Query)

## 🎯 Giới thiệu

TanStack Query (trước đây là React Query) là thư viện mạnh mẽ để quản lý server state, caching, và synchronization.

## 📦 Đã cài đặt

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## 🔧 Cấu hình

### 1. QueryClient đã được setup tại `src/utils/queryClient.js`

```javascript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 phút
    },
  },
});
```

### 2. QueryProvider đã được tạo tại `src/contexts/QueryProvider.jsx`

### 3. Wrap App với QueryProvider trong `src/App.jsx`

```jsx
<QueryProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</QueryProvider>
```

## 💡 Cách sử dụng

### Hook đã tạo sẵn trong `src/hooks/useTravelsQuery.js`:

#### 1. **Lấy danh sách travels**

```jsx
import { useTravelsQuery } from "../hooks/useTravelsQuery";

const { data: travels, isLoading, error } = useTravelsQuery();
```

#### 2. **Lấy travel theo ID**

```jsx
import { useTravelQuery } from "../hooks/useTravelsQuery";

const { data: travel, isLoading } = useTravelQuery(travelId);
```

#### 3. **Tạo travel mới**

```jsx
import { useCreateTravel } from "../hooks/useTravelsQuery";

const createMutation = useCreateTravel();

const handleCreate = async () => {
  await createMutation.mutateAsync({
    title: "Tour mới",
    description: "Mô tả",
  });
};
```

#### 4. **Cập nhật travel**

```jsx
import { useUpdateTravel } from "../hooks/useTravelsQuery";

const updateMutation = useUpdateTravel();

const handleUpdate = async (id) => {
  await updateMutation.mutateAsync({
    id,
    data: { title: "Tên mới" },
  });
};
```

#### 5. **Xóa travel**

```jsx
import { useDeleteTravel } from "../hooks/useTravelsQuery";

const deleteMutation = useDeleteTravel();

const handleDelete = async (id) => {
  await deleteMutation.mutateAsync(id);
};
```

## ✨ Ưu điểm so với custom hook cũ

### Custom Hook cũ (useTravels.js)

- ❌ Phải tự quản lý loading, error state
- ❌ Không có caching
- ❌ Không tự động refetch
- ❌ Code nhiều hơn

### TanStack Query (useTravelsQuery.js)

- ✅ Auto caching
- ✅ Auto refetch khi cần
- ✅ Optimistic updates
- ✅ Pagination & infinite scroll support
- ✅ DevTools để debug
- ✅ Code ngắn gọn hơn

## 🎨 Ví dụ hoàn chỉnh

Xem file `src/pages/TravelsPageWithQuery.jsx` để xem ví dụ đầy đủ.

## 🛠️ DevTools

React Query DevTools sẽ tự động hiển thị ở góc dưới màn hình khi chạy development mode. Bạn có thể:

- Xem các queries đang chạy
- Xem cache data
- Invalidate queries
- Refetch manually

## 📚 Tài liệu

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Tutorial](https://tanstack.com/query/latest/docs/framework/react/overview)
