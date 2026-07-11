import { Navigate, Outlet } from 'react-router-dom';
import { getAdminAuth } from '../utils/api';

const AdminRoute = () => {
  const { role, token } = getAdminAuth();
  const isAdmin = role === 'admin' && Boolean(token);

  return isAdmin ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default AdminRoute;
