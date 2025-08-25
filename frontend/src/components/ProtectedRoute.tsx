// src/components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const token = localStorage.getItem('token');
  let role = '';

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      role = payload.role;
    } catch (err) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }
  }

  if (!token || !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
}