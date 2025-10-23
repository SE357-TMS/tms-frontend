import { AuthProvider } from './hooks/useAuth';
import { QueryProvider } from './contexts/QueryProvider';
import { AppRouter } from './routes';
import './App.css';

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
