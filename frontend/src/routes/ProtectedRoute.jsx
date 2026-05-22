import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleLogin from '../pages/RoleLogin';

export default function ProtectedRoute({ roles, loginRole }) {
  const { user } = useAuth();
  if (!user && loginRole) return <RoleLogin role={loginRole} />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
