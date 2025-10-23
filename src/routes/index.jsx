import { RouterProvider } from 'react-router-dom';
import { router } from './router.jsx';

// Router Component để sử dụng trong App
export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
