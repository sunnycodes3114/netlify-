import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthenticationStatus } from '@nhost/react';
function AuthGate({ children }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
export default AuthGate;

