import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Chờ kiểm tra phiên hoàn tất trước khi quyết định
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AuthRoute;
