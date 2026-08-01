import { Navigate,useLocation  } from 'react-router-dom';
import { useAuth } from '../../components/context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, mustChangePassword } = useAuth();
  const location = useLocation();

  if (loading) return <p>Loading...</p>; 

  if (!user) return <Navigate to="/" replace />;

  if (mustChangePassword && location.pathname !== "/profile") {
    return <Navigate to="/profile" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
