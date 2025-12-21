import { createBrowserRouter } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/adminLayout/AdminLayout/AdminLayout';
import CustomerLayout from '../layouts/customerLayout/CustomerLayout/CustomerLayout';
import HomePage from '../pages/HomePage/Home.jsx';
import DashboardPage from '../pages/DashboardPage/index.jsx';
import LoginPage from '../pages/LoginPage/index.jsx';
import RegisterPage from '../pages/RegisterPage/index.jsx';
import TravelsPage from '../pages/TravelsPage/index.jsx';
import TravelsPageWithQuery from '../pages/TravelsPageWithQuery/index.jsx';
import TravelDetailPage from '../pages/TravelDetailPage/index.jsx';
import UsersPage from '../pages/UsersPage/index.jsx';
import StaffPage from '../pages/StaffPage/index.jsx';
// import CustomersPage from '../pages/CustomersPage/index.jsx';
import TripsPage from '../pages/TripsPage/index.jsx';
import BookingsPage from '../pages/BookingsPage/index.jsx';
import BookingDetailPage from '../pages/BookingDetailPage/index.jsx';
import BookingAddPage from '../pages/BookingAddPage/index.jsx';
import BookingEditPage from '../pages/BookingEditPage/index.jsx';
import InvoicesPage from '../pages/InvoicesPage/index.jsx';
import AttractionsPage from '../pages/AttractionsPage/index.jsx';
import StatisticsPage from '../pages/StatisticsPage/index.jsx';
import CustomerRouteDetailPage from '../pages/customer/RouteDetailPage/index.jsx';
import SearchResultsPage from '../pages/customer/SearchResultsPage/SearchResultsPage';
import CartPage from '../pages/customer/CartPage/index.jsx';
import PassengerListPage from '../pages/customer/PassengerListPage/index.jsx';
import ReservationPage from '../pages/customer/ReservationPage/index.jsx';
import PaymentPage from '../pages/customer/PaymentPage/index.jsx';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

// Định nghĩa routes
const LoadingScreen = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#ffffff'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '48px',
        height: '48px',
        margin: '0 auto 16px',
        border: '4px solid #f3f4f6',
        borderTopColor: '#4D40CA',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg) }
        }
      `}</style>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải...</p>
    </div>
  </div>
);

const CustomerAccessGuard = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  // Customer routes (public)
  {
    element: (
      <CustomerAccessGuard>
        <CustomerLayout />
      </CustomerAccessGuard>
    ),
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/search',
        element: <SearchResultsPage />,
      },
      {
        path: '/routes/:id',
        element: <CustomerRouteDetailPage />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/passengers/:bookingId',
        element: <PassengerListPage />,
      },
      {
        path: '/passengers/new',
        element: <PassengerListPage />,
      },
      {
        path: '/reservations',
        element: <ReservationPage />,
      },
      {
        path: '/payment/:bookingId',
        element: <PaymentPage />,
      },
    ],
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
      <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/customers',
        element: <UsersPage />,
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
        path: '/trips',
        element: <TripsPage />,
      },
      {
        path: '/bookings',
        element: <BookingsPage />,
      },
      {
        path: '/bookings/new',
        element: <BookingAddPage />,
      },
      {
        path: '/bookings/:id',
        element: <BookingDetailPage />,
      },
      {
        path: '/bookings/:id/edit',
        element: <BookingEditPage />,
      },
      {
        path: '/invoices',
        element: <InvoicesPage />,
      },
      {
        path: '/attractions',
        element: <AttractionsPage />,
      },
      {
        path: '/reports',
        element: <StatisticsPage />,
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
