import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthenticationStatus } from '@nhost/react';

export default function AuthGate({ children }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  if (isLoading) return <div style={{ color: 'white' }}>Checking auth...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
