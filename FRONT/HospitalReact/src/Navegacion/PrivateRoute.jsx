import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');

  useEffect(() => {
    if (!token && location.pathname !== '/') {
      toast.error('Debes iniciar sesión para acceder a esta página', {
        position: "top-right",
        autoClose: 3000
      });
    }
  }, [token, location.pathname]);

  return token ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;