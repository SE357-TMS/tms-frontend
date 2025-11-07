import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/adminLayout/AdminLayout/AdminLayout';
import HomePage from '../pages/HomePage/index.jsx';
import DashboardPage from '../pages/DashboardPage/index.jsx';
import LoginPage from '../pages/LoginPage/index.jsx';
import RegisterPage from '../pages/RegisterPage/index.jsx';
import TravelsPage from '../pages/TravelsPage/index.jsx';
import TravelsPageWithQuery from '../pages/TravelsPageWithQuery/index.jsx';
import TravelDetailPage from '../pages/TravelDetailPage/index.jsx';
import UsersPage from '../pages/UsersPage/index.jsx';
import StaffPage from '../pages/StaffPage/index.jsx';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';

// Định nghĩa routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
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
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/staff',
        element: <StaffPage />,
      },
      {
        path: '/travels',
        element: <TravelsPage />,
      },
      {
        path: '/travels/:id',
        element: <TravelDetailPage />,
      },
      {
        path: '/travels-query',
        element: <TravelsPageWithQuery />,
      },
      {
        path: '/users',
        element: <UsersPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
