import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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

const ProtectedRoute = ({ children, allowedRoles = [], fallback }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    const defaultPath = fallback || (user?.role === 'ADMIN' ? '/dashboard' : '/');
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
