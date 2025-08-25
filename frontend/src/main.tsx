import './index.css';                           
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';  
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import VoterDashboard from './pages/VoterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
          <Route path="/admin-register" element={<AdminRegister />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['voter']} />}>
          <Route path="/voter-dashboard/*" element={<VoterDashboard />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
          <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);