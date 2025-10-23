import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import TravelsPage from '../pages/TravelsPage';
import TravelsPageWithQuery from '../pages/TravelsPageWithQuery';
import TravelDetailPage from '../pages/TravelDetailPage';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

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
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/travels',
    element: (
      <ProtectedRoute>
        <TravelsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/travels/:id',
    element: (
      <ProtectedRoute>
        <TravelDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/travels-query',
    element: (
      <ProtectedRoute>
        <TravelsPageWithQuery />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <div>404 - Không tìm thấy trang</div>,
  },
]);
