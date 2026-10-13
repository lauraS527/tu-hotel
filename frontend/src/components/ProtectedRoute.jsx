import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Solo es comodidad de interfaz: la seguridad real está en el backend (verifyToken / isAdmin).
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}
