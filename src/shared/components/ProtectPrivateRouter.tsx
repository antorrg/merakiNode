import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedPrivateRouterProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedPrivateRouter = ({ children, allowedRoles }: ProtectedPrivateRouterProps) => {
  const { isAuthenticated, user, loading, isLoggingOut } = useAuth();

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // 1. Si no está autenticado y no está cerrando sesión -> Redirigir a WelcomePage ('/')
  if (!isAuthenticated && !isLoggingOut) {
    return <Navigate to="/" replace />;
  }

  // 2. Si está autenticado pero la ruta exige roles específicos y el rol del usuario no coincide -> Redirigir a '/not-authorized'
  if (isAuthenticated && allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/not-authorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedPrivateRouter;