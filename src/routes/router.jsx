import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage/index.jsx';
import DashboardPage from '../pages/DashboardPage/index.jsx';
import LoginPage from '../pages/LoginPage/index.jsx';
import RegisterPage from '../pages/RegisterPage/index.jsx';
import TravelsPage from '../pages/TravelsPage/index.jsx';
import TravelsPageWithQuery from '../pages/TravelsPageWithQuery/index.jsx';
import TravelDetailPage from '../pages/TravelDetailPage/index.jsx';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './PublicRoute';

// Định nghĩa routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <PublicRoute>
        <DashboardPage />
      </PublicRoute>
    ),
  },
  {
    path: '/travels',
    element: (
      <PublicRoute>
        <TravelsPage />
      </PublicRoute>
    ),
  },
  {
    path: '/travels/:id',
    element: (
      <PublicRoute>
        <TravelDetailPage />
      </PublicRoute>
    ),
  },
  {
    path: '/travels-query',
    element: (
      <PublicRoute>
        <TravelsPageWithQuery />
      </PublicRoute>
    ),
  },
  {
    path: '*',
    element: <div>404 - Không tìm thấy trang</div>,
  },
]);
