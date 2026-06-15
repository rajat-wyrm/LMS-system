import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const isAdmin = localStorage.getItem('role') === 'admin';

  return isAdmin ? <Outlet /> : <Navigate to="/admin-login" replace />;
};

export default AdminRoute;
