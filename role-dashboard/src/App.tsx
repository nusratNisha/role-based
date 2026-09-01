import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Users } from '@/pages/Users';
import { UserForm } from '@/pages/UserForm';
import { Settings } from '@/pages/Settings';
import { Unauthorized } from '@/pages/Unauthorized';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={
          <ProtectedRoute permission="dashboard:read">
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute permission="users:read">
            <Users />
          </ProtectedRoute>
        } />
        
        <Route path="/users/new" element={
          <ProtectedRoute permission="users:create">
            <UserForm />
          </ProtectedRoute>
        } />
        
        <Route path="/users/edit/:id" element={
          <ProtectedRoute permission="users:update">
            <UserForm />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute permission="settings:read">
            <Settings />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;